[**GigaScramSoft - Documentation v0.0.0**](../../../README.md)

***

[GigaScramSoft - Documentation](../../../modules.md) / [services/contentService](../README.md) / contentService

# Variable: contentService

> `const` **contentService**: `object`

Defined in: [services/contentService.ts:8](https://github.com/twxng/software-dist-hub/blob/0197ab9d192432e7d546a700724095989673c197/client/GigaScramSoft/src/services/contentService.ts#L8)

## Type declaration

### createContent()

> **createContent**(`contentData`): `Promise`\<[`ApiResponse`](../../../types/api.types/interfaces/ApiResponse.md)\<[`ContentUnit`](../../../types/content/interfaces/ContentUnit.md)\>\>

#### Parameters

##### contentData

[`ContentUnitDTO`](../../../types/content/interfaces/ContentUnitDTO.md)

#### Returns

`Promise`\<[`ApiResponse`](../../../types/api.types/interfaces/ApiResponse.md)\<[`ContentUnit`](../../../types/content/interfaces/ContentUnit.md)\>\>

### deleteContent()

> **deleteContent**(`id`): `Promise`\<[`ApiResponse`](../../../types/api.types/interfaces/ApiResponse.md)\<`boolean`\>\>

#### Parameters

##### id

`number`

#### Returns

`Promise`\<[`ApiResponse`](../../../types/api.types/interfaces/ApiResponse.md)\<`boolean`\>\>

### downvoteContent()

> **downvoteContent**(`contentUnitId`): `Promise`\<[`ApiResponse`](../../../types/api.types/interfaces/ApiResponse.md)\<`boolean`\>\>

#### Parameters

##### contentUnitId

`number`

#### Returns

`Promise`\<[`ApiResponse`](../../../types/api.types/interfaces/ApiResponse.md)\<`boolean`\>\>

### getAllContent()

> **getAllContent**(`onItemReceived`?): `Promise`\<[`ApiResponse`](../../../types/api.types/interfaces/ApiResponse.md)\<[`ContentUnit`](../../../types/content/interfaces/ContentUnit.md)[]\>\>

#### Parameters

##### onItemReceived?

(`item`) => `void`

#### Returns

`Promise`\<[`ApiResponse`](../../../types/api.types/interfaces/ApiResponse.md)\<[`ContentUnit`](../../../types/content/interfaces/ContentUnit.md)[]\>\>

### getCategories()

> **getCategories**(): `Promise`\<[`ApiResponse`](../../../types/api.types/interfaces/ApiResponse.md)\<[`ContentUnitSubCategoryModel`](../../../types/content/interfaces/ContentUnitSubCategoryModel.md)[]\>\>

#### Returns

`Promise`\<[`ApiResponse`](../../../types/api.types/interfaces/ApiResponse.md)\<[`ContentUnitSubCategoryModel`](../../../types/content/interfaces/ContentUnitSubCategoryModel.md)[]\>\>

### getContentById()

> **getContentById**(`id`): `Promise`\<[`ApiResponse`](../../../types/api.types/interfaces/ApiResponse.md)\<[`ContentUnit`](../../../types/content/interfaces/ContentUnit.md)\>\>

#### Parameters

##### id

`number`

#### Returns

`Promise`\<[`ApiResponse`](../../../types/api.types/interfaces/ApiResponse.md)\<[`ContentUnit`](../../../types/content/interfaces/ContentUnit.md)\>\>

### getPopularContent()

> **getPopularContent**(`onItemReceived`?): `Promise`\<[`ApiResponse`](../../../types/api.types/interfaces/ApiResponse.md)\<[`ContentUnit`](../../../types/content/interfaces/ContentUnit.md)[]\>\>

#### Parameters

##### onItemReceived?

(`item`) => `void`

#### Returns

`Promise`\<[`ApiResponse`](../../../types/api.types/interfaces/ApiResponse.md)\<[`ContentUnit`](../../../types/content/interfaces/ContentUnit.md)[]\>\>

### getSubCategories()

> **getSubCategories**(`mainCategoryId`): `Promise`\<[`ApiResponse`](../../../types/api.types/interfaces/ApiResponse.md)\<[`ContentUnitSubCategoryModel`](../../../types/content/interfaces/ContentUnitSubCategoryModel.md)[]\>\>

#### Parameters

##### mainCategoryId

`number`

#### Returns

`Promise`\<[`ApiResponse`](../../../types/api.types/interfaces/ApiResponse.md)\<[`ContentUnitSubCategoryModel`](../../../types/content/interfaces/ContentUnitSubCategoryModel.md)[]\>\>

### searchContentByName()

> **searchContentByName**(`searchQuery`): `Promise`\<[`ApiResponse`](../../../types/api.types/interfaces/ApiResponse.md)\<[`ContentUnit`](../../../types/content/interfaces/ContentUnit.md)[]\>\>

#### Parameters

##### searchQuery

`string`

#### Returns

`Promise`\<[`ApiResponse`](../../../types/api.types/interfaces/ApiResponse.md)\<[`ContentUnit`](../../../types/content/interfaces/ContentUnit.md)[]\>\>

### testConnection()

> **testConnection**(): `Promise`\<[`ApiResponse`](../../../types/api.types/interfaces/ApiResponse.md)\<[`ContentUnitSubCategoryModel`](../../../types/content/interfaces/ContentUnitSubCategoryModel.md)[]\>\>

#### Returns

`Promise`\<[`ApiResponse`](../../../types/api.types/interfaces/ApiResponse.md)\<[`ContentUnitSubCategoryModel`](../../../types/content/interfaces/ContentUnitSubCategoryModel.md)[]\>\>

### updateContent()

> **updateContent**(`id`, `contentData`): `Promise`\<[`ApiResponse`](../../../types/api.types/interfaces/ApiResponse.md)\<[`ContentUnit`](../../../types/content/interfaces/ContentUnit.md)\>\>

#### Parameters

##### id

`number`

##### contentData

[`ContentUnitDTO`](../../../types/content/interfaces/ContentUnitDTO.md)

#### Returns

`Promise`\<[`ApiResponse`](../../../types/api.types/interfaces/ApiResponse.md)\<[`ContentUnit`](../../../types/content/interfaces/ContentUnit.md)\>\>

### upvoteContent()

> **upvoteContent**(`contentUnitId`): `Promise`\<[`ApiResponse`](../../../types/api.types/interfaces/ApiResponse.md)\<`boolean`\>\>

#### Parameters

##### contentUnitId

`number`

#### Returns

`Promise`\<[`ApiResponse`](../../../types/api.types/interfaces/ApiResponse.md)\<`boolean`\>\>
