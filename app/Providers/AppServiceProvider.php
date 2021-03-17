<?php

namespace App\Providers;

use App\Order;
use App\Message;
use App\PaymentRequest;
use Laravel\Horizon\Horizon;
use App\Observers\OrderObserver;
use App\Observers\MessageObserver;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\Queue;
use Illuminate\Queue\Events\JobFailed;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;
use App\Observers\PaymentRequestObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        // Fixing for RDS old version
        Schema::defaultStringLength(191);

        if (app()->environment() != 'local') {
            $this->app['request']->server->set('HTTPS', true);
        }

        Horizon::auth(function () {
            return auth()->check() && auth()->user()->is_admin;
        });

        Message::observe(MessageObserver::class);
        Order::observe(OrderObserver::class);
        PaymentRequest::observe(PaymentRequestObserver::class);
        // InviteCodeHistory::observe(InviteCodeHistoryObserver::class);

        Blade::component('web.components.modal', 'modal');
        Blade::component('web.components.confirm_modal', 'confirm');
        Blade::component('web.components.alert', 'alert');

        Queue::failing(function (JobFailed $event) {
            Log::channel('jobs')->info('Job Failed:');
            // Log::channel('jobs')->info($event->connectionName);
            Log::channel('jobs')->debug($event->job->getJobId());
            Log::channel('jobs')->debug($event->job->payload());
            Log::channel('jobs')->debug($event->exception);
        });
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }
}
