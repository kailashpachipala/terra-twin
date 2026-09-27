import { CreateFarmData, CreateFarmVariables, CreateScoutingTaskData, CreateScoutingTaskVariables, ListMyFarmsData, GetFieldMetricsData, GetFieldMetricsVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateFarm(options?: useDataConnectMutationOptions<CreateFarmData, FirebaseError, CreateFarmVariables>): UseDataConnectMutationResult<CreateFarmData, CreateFarmVariables>;
export function useCreateFarm(dc: DataConnect, options?: useDataConnectMutationOptions<CreateFarmData, FirebaseError, CreateFarmVariables>): UseDataConnectMutationResult<CreateFarmData, CreateFarmVariables>;

export function useCreateScoutingTask(options?: useDataConnectMutationOptions<CreateScoutingTaskData, FirebaseError, CreateScoutingTaskVariables>): UseDataConnectMutationResult<CreateScoutingTaskData, CreateScoutingTaskVariables>;
export function useCreateScoutingTask(dc: DataConnect, options?: useDataConnectMutationOptions<CreateScoutingTaskData, FirebaseError, CreateScoutingTaskVariables>): UseDataConnectMutationResult<CreateScoutingTaskData, CreateScoutingTaskVariables>;

export function useListMyFarms(options?: useDataConnectQueryOptions<ListMyFarmsData>): UseDataConnectQueryResult<ListMyFarmsData, undefined>;
export function useListMyFarms(dc: DataConnect, options?: useDataConnectQueryOptions<ListMyFarmsData>): UseDataConnectQueryResult<ListMyFarmsData, undefined>;

export function useGetFieldMetrics(vars: GetFieldMetricsVariables, options?: useDataConnectQueryOptions<GetFieldMetricsData>): UseDataConnectQueryResult<GetFieldMetricsData, GetFieldMetricsVariables>;
export function useGetFieldMetrics(dc: DataConnect, vars: GetFieldMetricsVariables, options?: useDataConnectQueryOptions<GetFieldMetricsData>): UseDataConnectQueryResult<GetFieldMetricsData, GetFieldMetricsVariables>;
