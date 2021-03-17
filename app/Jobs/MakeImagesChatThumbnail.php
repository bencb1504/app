<?php

namespace App\Jobs;

use App\Message;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Webpatser\Uuid\Uuid;

class MakeImagesChatThumbnail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $message;

    /**
     * Create a new job instance.
     *
     * @param $messageId
     */
    public function __construct($messageId)
    {
        $this->message = Message::onWriteConnection()->findOrFail($messageId);
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $info = pathinfo($this->message->image);
        $contents = file_get_contents($this->message->image);
        $imageName = Uuid::generate()->string . '.' . strtolower($info['extension']);
        $image = \Image::make($contents)->resize(500, null, function ($constraint) {
            $constraint->aspectRatio();
        })->encode($info['extension']);
        \Storage::put($imageName, $image->__toString(), 'public');
        $this->message->update([
            'thumbnail' => $imageName,
        ]);
    }
}
