# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createFarm, createScoutingTask, listMyFarms, getFieldMetrics } from '@dataconnect/generated';


// Operation CreateFarm:  For variables, look at type CreateFarmVars in ../index.d.ts
const { data } = await CreateFarm(dataConnect, createFarmVars);

// Operation CreateScoutingTask:  For variables, look at type CreateScoutingTaskVars in ../index.d.ts
const { data } = await CreateScoutingTask(dataConnect, createScoutingTaskVars);

// Operation ListMyFarms: 
const { data } = await ListMyFarms(dataConnect);

// Operation GetFieldMetrics:  For variables, look at type GetFieldMetricsVars in ../index.d.ts
const { data } = await GetFieldMetrics(dataConnect, getFieldMetricsVars);


```