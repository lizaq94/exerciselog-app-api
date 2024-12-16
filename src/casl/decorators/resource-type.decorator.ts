import { SetMetadata } from '@nestjs/common';
import { Resource } from '../types/resource.type';

export const RESOURCE_TYPE_KEY = 'resource_type';

export const ResourceType = (type: Resource) =>
  SetMetadata(RESOURCE_TYPE_KEY, type);
