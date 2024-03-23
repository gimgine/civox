/**
 * This file was @generated using pocketbase-typegen
 */

import type PocketBase from 'pocketbase';
import type { RecordService } from 'pocketbase';

export enum Collections {
  Developments = 'developments',
  Feedback = 'feedback',
  Users = 'users',
  Votes = 'votes'
}

// Alias types for improved usability
export type IsoDateString = string;
export type RecordIdString = string;
export type HTMLString = string;

// System fields
export type BaseSystemFields<T = never> = {
  id: RecordIdString;
  created: IsoDateString;
  updated: IsoDateString;
  collectionId: string;
  collectionName: Collections;
  expand?: T;
};

export type AuthSystemFields<T = never> = {
  email: string;
  emailVisibility: boolean;
  username: string;
  verified: boolean;
} & BaseSystemFields<T>;

// Record types for each collection

export enum DevelopmentsTypeOptions {
  'apartmentComplex' = 'apartmentComplex',
  'singleFamilyHome' = 'singleFamilyHome',
  'condominium' = 'condominium',
  'seniorLivingFacility' = 'seniorLivingFacility',
  'restaurant' = 'restaurant',
  'hotel' = 'hotel',
  'bank' = 'bank',
  'retailStore' = 'retailStore',
  'shoppingMall' = 'shoppingMall',
  'officeBuilding' = 'officeBuilding',
  'factory' = 'factory',
  'warehouse' = 'warehouse',
  'researchLab' = 'researchLab',
  'school' = 'school',
  'hospital' = 'hospital',
  'policeStation' = 'policeStation',
  'fireStation' = 'fireStation',
  'library' = 'library',
  'park' = 'park',
  'sportsComplex' = 'sportsComplex',
  'recreationalCenter' = 'recreationalCenter',
  'playground' = 'playground',
  'road' = 'road',
  'bridge' = 'bridge',
  'railway' = 'railway',
  'subway' = 'subway',
  'busStation' = 'busStation',
  'airport' = 'airport',
  'port' = 'port',
  'museum' = 'museum',
  'theater' = 'theater',
  'concertHall' = 'concertHall',
  'historicMonument' = 'historicMonument',
  'communityGarden' = 'communityGarden',
  'greenRoof' = 'greenRoof',
  'conservationArea' = 'conservationArea',
  'wildlifeHabitat' = 'wildlifeHabitat',
  'solarFarm' = 'solarFarm',
  'windTurbine' = 'windTurbine',
  'waterTreatmentPlanttment Plant' = 'waterTreatmentPlanttment Plant'
}
export type DevelopmentsRecord = {
  description?: string;
  expectedStart?: IsoDateString;
  images?: string[];
  proposedBy?: string;
  title?: string;
  type?: DevelopmentsTypeOptions;
};

export type FeedbackRecord = {
  content?: string;
  development?: RecordIdString;
  username?: string;
};

export type UsersRecord = {
  avatar?: string;
  name?: string;
};

export enum VotesValueOptions {
  'yay' = 'yay',
  'nay' = 'nay'
}
export type VotesRecord = {
  development?: RecordIdString;
  value?: VotesValueOptions;
};

// Response types include system fields and match responses from the PocketBase API
export type DevelopmentsResponse<Texpand = unknown> = Required<DevelopmentsRecord> & BaseSystemFields<Texpand>;
export type FeedbackResponse<Texpand = unknown> = Required<FeedbackRecord> & BaseSystemFields<Texpand>;
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>;
export type VotesResponse<Texpand = unknown> = Required<VotesRecord> & BaseSystemFields<Texpand>;

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
  developments: DevelopmentsRecord;
  feedback: FeedbackRecord;
  users: UsersRecord;
  votes: VotesRecord;
};

export type CollectionResponses = {
  developments: DevelopmentsResponse;
  feedback: FeedbackResponse;
  users: UsersResponse;
  votes: VotesResponse;
};

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
  collection(idOrName: 'developments'): RecordService<DevelopmentsResponse>;
  collection(idOrName: 'feedback'): RecordService<FeedbackResponse>;
  collection(idOrName: 'users'): RecordService<UsersResponse>;
  collection(idOrName: 'votes'): RecordService<VotesResponse>;
};
