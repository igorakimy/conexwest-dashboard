<?php

namespace App\Services\Traits;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;

trait CanSendPostRequest
{
    public function post(PendingRequest $request, string $url, array $payload = []): Response
    {
        return $request->withQueryParameters($payload)->post($url);
    }
}
