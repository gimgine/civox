import PocketBase from 'pocketbase';
import type { TypedPocketBase } from '@/util/pocketbase-types';

const pb = new PocketBase('https://civox.pockethost.io') as TypedPocketBase;

export default pb;
