<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class Handler extends ExceptionHandler
{
    /**
     * A list of the exception types that are not reported.
     *
     * @var array
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed for validation exceptions.
     *
     * @var array
     */
    protected $dontFlash = [
        'password',
        'password_confirmation',
    ];

    /**
     * Report or log an exception.
     *
     * @param  \Exception  $exception
     * @return void
     */
    public function report(Exception $exception)
    {
        if (app()->bound('sentry') && $this->shouldReport($exception)) {
            app('sentry')->captureException($exception);
        }

        parent::report($exception);
    }

    /**
     * Render an exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Exception  $exception
     * @return \Illuminate\Http\Response
     */
    public function render($request, Exception $exception)
    {
        if ($exception instanceof ModelNotFoundException || $exception instanceof NotFoundHttpException) {
            if (strpos(url()->current(), '/api/') !== false) {
                return response()->json([
                    'status' => false,
                    'message' => 'Not Found.',
                ], 404);
            }
        }

        if ($exception instanceof \Illuminate\Foundation\Http\Exceptions\MaintenanceModeException) {
            if($request->is('api*')) {
                return response()->json(['message' => '現在システムメンテナンス中です。しばらく経ってから再度アクセスしてください。'], 503);
            } else {
                return response()
                    ->view('errors.maintenance', [
                        'message' => '現在システムメンテナンス中です。しばらく経ってから再度アクセスしてください。'
                    ], 200)
                    ->header('Content-Type', 'text/html; charset=utf-8');
            }
        }
        return parent::render($request, $exception);
    }

    protected function unauthenticated($request, AuthenticationException $exception)
    {
        if ($request->expectsJson() || in_array('api', $exception->guards())) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        return redirect()->route('web.index');
    }
}
