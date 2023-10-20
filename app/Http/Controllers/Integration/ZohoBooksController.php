<?php

namespace App\Http\Controllers\Integration;

use App\Actions\Integration\ZohoBooks\Auth\CheckGrantCode;
use App\Actions\Integration\ZohoBooks\Auth\GetAuthUrl;
use App\Data\Integration\ZohoBooks\Auth\CheckGrantCodeData;
use App\Http\Controllers\ApiController;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Psr\SimpleCache\InvalidArgumentException;

final class ZohoBooksController extends ApiController
{
    public function __construct(
        private readonly GetAuthUrl $getAuthUrlAction,
        private readonly CheckGrantCode $checkGrantCodeAction,
    ) {
    }

    /**
     * Get auth url to authenticate in Zoho Books.
     *
     * @return Response
     */
    public function authenticateUrl()
    {
        $authURLData = $this->getAuthUrlAction->handle();

        return response($authURLData);
    }

    /**
     * Check grant code from Zoho Books to redirect_uri.
     *
     * @param  Request  $request
     *
     * @return Response
     * @throws InvalidArgumentException
     */
    public function handleAuthCallback(Request $request): Response
    {
        $checkData = CheckGrantCodeData::fromRequest($request);

        $accessTokenData = $this->checkGrantCodeAction->handle($checkData);

        return response($accessTokenData);
    }


}
