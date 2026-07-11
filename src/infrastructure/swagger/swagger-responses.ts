import { applyDecorators } from '@nestjs/common';
import {
  ApiResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';

export const ApiAuthResponses = () =>
  applyDecorators(
    ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer token' }),
    ApiForbiddenResponse({ description: 'Token expired or revoked' }),
  );

export const ApiRateLimitResponse = () =>
  ApiTooManyRequestsResponse({
    description:
      'Too many requests — limit: 10/min for auth, 100/min for other endpoints',
  });

export const ApiNotFoundResponse = (resource: string) =>
  ApiResponse({ status: 404, description: `${resource} not found` });

export const ApiValidationResponse = () =>
  ApiResponse({
    status: 400,
    description: 'Validation error — invalid request body',
  });

export const ApiConflictResponse = (description: string) =>
  ApiResponse({ status: 409, description });
