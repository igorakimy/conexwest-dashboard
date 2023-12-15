<?php

namespace App\Data\Integration\ZohoInventory\Setting;

use App\Data\Integration\ZohoBooks\Setting\FieldData;
use Illuminate\Http\Client\Response;
use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\DataCollection;

final class FieldsResponseData extends Data
{
    public function __construct(
        public bool $success,

        #[DataCollectionOf(FieldData::class)]
        public DataCollection $fields,

        public ?string $message,
    ) {
    }

    public static function fromResponse(Response $response): self
    {
        return new self(
            success: $response->successful(),
            fields: FieldData::collection($response->json('fields')),
            message: $response->json('message'),
        );
    }
}
