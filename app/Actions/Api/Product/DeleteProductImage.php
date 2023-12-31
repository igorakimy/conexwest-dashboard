<?php

namespace App\Actions\Api\Product;

use App\Actions\Api\ApiAction;
use App\Models\Product;
use Spatie\MediaLibrary\MediaCollections\Exceptions\MediaCannotBeDeleted;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

final class DeleteProductImage extends ApiAction
{
    /**
     * @throws MediaCannotBeDeleted
     */
    public function handle(Product $product, string $mediaID): Media|null
    {
        /** @var Media $media */
        $media = Media::query()->find($mediaID);

        if ($media) {
            $product->deleteMedia($media);
        }

        return $media;
    }
}
