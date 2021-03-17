<?php

namespace App\Http\ViewComposers;

use App\Notification;
use Illuminate\View\View;

class NotificationComposer
{
    /**
     * The user repository implementation.
     *
     * @var  UserRepository
     */
    protected $notifications;

    /**
     * Create a new profile composer.
     *
     * @param    UserRepository  $users
     * @return  void
     */
    public function __construct()
    {
        // Dependencies automatically resolved by service container...
        $this->notifications = Notification::whereIn('type', [
            'App\Notifications\CreatedReport',
            'App\Notifications\PaymentRequestUpdate',
            'App\Notifications\AutoChargeFailed'
        ])
            ->whereNull('read_at')->get();
    }

    /**
     * Bind data to the view.
     *
     * @param    View  $view
     * @return  void
     */
    public function compose(View $view)
    {
        $view->with('notifications', $this->notifications);
    }
}
