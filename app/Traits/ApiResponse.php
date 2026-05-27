<?php

namespace App\Traits;

trait ApiResponse
{
    protected function successResponse($data = null, $message = 'Success', $statusCode = 200)
    {
        return response()->json([
            'status'  => 'success',
            'message' => $message,
            'data'    => $data,
        ], $statusCode);
    }

    protected function errorResponse($message = 'Error', $errors = null, $statusCode = 400)
    {
        return response()->json([
            'status'  => 'error',
            'message' => $message,
            'errors'  => $errors,
        ], $statusCode);
    }
}