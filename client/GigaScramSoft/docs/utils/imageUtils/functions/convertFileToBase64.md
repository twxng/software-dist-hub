[**GigaScramSoft - Documentation v0.0.0**](../../../README.md)

***

[GigaScramSoft - Documentation](../../../modules.md) / [utils/imageUtils](../README.md) / convertFileToBase64

# Function: convertFileToBase64()

> **convertFileToBase64**(`file`, `maxSize`?, `stripPrefix`?): `Promise`\<`string`\>

Defined in: utils/imageUtils.ts:63

Converts a File object to a base64 string

## Parameters

### file

`File`

File object for conversion

### maxSize?

`number`

Maximum size in bytes (optional)

### stripPrefix?

`boolean` = `true`

Whether to remove the "data:image/..." prefix (default: true)

## Returns

`Promise`\<`string`\>

Promise with the base64 string
