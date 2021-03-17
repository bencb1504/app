<?php

namespace App\Jobs;

use App\Avatar;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Webpatser\Uuid\Uuid;

class MakeAvatarThumbnail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $avatar;

    /**
     * Create a new job instance.
     *
     * @param $avatarId
     */
    public function __construct($avatarId)
    {
        $this->avatar = Avatar::onWriteConnection()->findOrFail($avatarId);
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        if (!empty($this->avatar->getOriginal('thumbnail'))) {
            $nameThumbnailOld = $this->avatar->getOriginal('thumbnail');
            \Storage::delete($nameThumbnailOld);
        }

        $info = pathinfo($this->avatar->path);
        $contents = file_get_contents($this->avatar->path);
        $thumbnailName = Uuid::generate()->string . '.' . strtolower($info['extension']);
        $image = \Image::make($contents)->resize(200, null, function ($constraint) {
            $constraint->aspectRatio();
        })->encode($info['extension']);

        \Storage::put($thumbnailName, $image->__toString(), 'public');

        $this->avatar->update([
            'thumbnail' => $thumbnailName,
        ]);
    }
}
