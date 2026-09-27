import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise, DataConnectSettings } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;
export const dataConnectSettings: DataConnectSettings;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreateFarmData {
  farm_insert: Farm_Key;
}

export interface CreateFarmVariables {
  name: string;
  totalAcreage: number;
  locationGeometry: string;
}

export interface CreateScoutingTaskData {
  scoutingTask_insert: ScoutingTask_Key;
}

export interface CreateScoutingTaskVariables {
  fieldId: UUIDString;
  status: string;
  priority: string;
  dueDate: TimestampString;
}

export interface Farm_Key {
  id: UUIDString;
  __typename?: 'Farm_Key';
}

export interface Field_Key {
  id: UUIDString;
  __typename?: 'Field_Key';
}

export interface GetFieldMetricsData {
  satelliteMetrics: ({
    timestamp: TimestampString;
    ndviScore: number;
    soilMoistureIndex: number;
    alertTriggered?: boolean | null;
  })[];
}

export interface GetFieldMetricsVariables {
  fieldId: UUIDString;
}

export interface ListMyFarmsData {
  farms: ({
    id: UUIDString;
    name: string;
    totalAcreage?: number | null;
    fields_on_farm: ({
      name: string;
      cropType: string;
    })[];
  } & Farm_Key)[];
}

export interface SatelliteMetric_Key {
  id: UUIDString;
  __typename?: 'SatelliteMetric_Key';
}

export interface ScoutingTask_Key {
  id: UUIDString;
  __typename?: 'ScoutingTask_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateFarmRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateFarmVariables): MutationRef<CreateFarmData, CreateFarmVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateFarmVariables): MutationRef<CreateFarmData, CreateFarmVariables>;
  operationName: string;
}
export const createFarmRef: CreateFarmRef;

export function createFarm(vars: CreateFarmVariables): MutationPromise<CreateFarmData, CreateFarmVariables>;
export function createFarm(dc: DataConnect, vars: CreateFarmVariables): MutationPromise<CreateFarmData, CreateFarmVariables>;

interface CreateScoutingTaskRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateScoutingTaskVariables): MutationRef<CreateScoutingTaskData, CreateScoutingTaskVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateScoutingTaskVariables): MutationRef<CreateScoutingTaskData, CreateScoutingTaskVariables>;
  operationName: string;
}
export const createScoutingTaskRef: CreateScoutingTaskRef;

export function createScoutingTask(vars: CreateScoutingTaskVariables): MutationPromise<CreateScoutingTaskData, CreateScoutingTaskVariables>;
export function createScoutingTask(dc: DataConnect, vars: CreateScoutingTaskVariables): MutationPromise<CreateScoutingTaskData, CreateScoutingTaskVariables>;

interface ListMyFarmsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListMyFarmsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListMyFarmsData, undefined>;
  operationName: string;
}
export const listMyFarmsRef: ListMyFarmsRef;

export function listMyFarms(options?: ExecuteQueryOptions): QueryPromise<ListMyFarmsData, undefined>;
export function listMyFarms(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListMyFarmsData, undefined>;

interface GetFieldMetricsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetFieldMetricsVariables): QueryRef<GetFieldMetricsData, GetFieldMetricsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetFieldMetricsVariables): QueryRef<GetFieldMetricsData, GetFieldMetricsVariables>;
  operationName: string;
}
export const getFieldMetricsRef: GetFieldMetricsRef;

export function getFieldMetrics(vars: GetFieldMetricsVariables, options?: ExecuteQueryOptions): QueryPromise<GetFieldMetricsData, GetFieldMetricsVariables>;
export function getFieldMetrics(dc: DataConnect, vars: GetFieldMetricsVariables, options?: ExecuteQueryOptions): QueryPromise<GetFieldMetricsData, GetFieldMetricsVariables>;

