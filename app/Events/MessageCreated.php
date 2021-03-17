<?php

namespace App\Events;

use App\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use App\Http\Resources\MessageResource;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class MessageCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct($messageId)
    {
        $this->message = Message::onWriteConnection()->findOrFail($messageId);
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        $channels = [];
        $channels[] = new PrivateChannel('room.' . $this->message->room_id);

        $recipients = $this->message->recipients;
        foreach ($recipients as $recipient) {
            $channels[] = new PrivateChannel('user.' . $recipient->id);
        }

        return $channels;
    }

    public function broadcastWith()
    {
        return [
            'message' => MessageResource::make($this->message),
        ];
    }

    public function broadcastWhen()
    {
        $room = $this->message->room;

        if (!$room->is_direct) {
            return true;
        }

        $recipient = $this->message->recipients()->first();

        if (!$recipient) {
            return true;
        }

        if (!$room->checkBlocked($recipient->id)) {
            return true;
        }

        return false;
    }
}
