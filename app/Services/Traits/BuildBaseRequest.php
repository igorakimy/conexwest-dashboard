<?php

namespace App\Services\Traits;

use Http;
use Illuminate\Http\Client\PendingRequest;

trait BuildBaseRequest
{
    /**
     * Build base request.
     *
     * @param  string  $customUrl
     *
     * @return PendingRequest
     */
    public function buildRequest(string $customUrl = ''): PendingRequest
    {
        if ($customUrl) {
            $baseUrl = $this->withCustomBaseUrl($customUrl);
        } else {
            $baseUrl = $this->withBaseUrl();
        }

        return $baseUrl->timeout($this->timeout ?? 1);
    }

    /**
     * Build base request with token.
     *
     * @return PendingRequest
     */
    public function buildRequestWithToken(): PendingRequest
    {
        return $this
            ->withBaseUrl()
            ->timeout($this->timeout ?? 1)
            ->withHeader('Authorization', $this->apiToken());
    }

    /**
     * Get pending request with custom base url
     *
     * @param  string  $url
     *
     * @return PendingRequest
     */
    public function withCustomBaseUrl(string $url): PendingRequest
    {
        return Http::baseUrl($url);
    }

    /**
     * Get pending request with base url.
     *
     * @return PendingRequest
     */
    public function withBaseUrl(): PendingRequest
    {
        return Http::baseUrl($this->apiUrl());
    }
}
