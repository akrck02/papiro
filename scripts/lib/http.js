/**
 * This enum represents the available HTTP methods
 * @author akrck02
 */
export var HttpMethod;
(function (HttpMethod) {
    HttpMethod["Get"] = "GET";
    HttpMethod["Post"] = "POST";
    HttpMethod["Put"] = "PUT";
    HttpMethod["Delete"] = "DELETE";
    HttpMethod["Update"] = "UPDATE";
    HttpMethod["Patch"] = "PATCH";
    HttpMethod["Head"] = "HEAD";
    HttpMethod["Options"] = "OPTIONS";
    HttpMethod["Connect"] = "CONNECT";
    HttpMethod["Trace"] = "TRACE";
    HttpMethod["All"] = "ALL";
})(HttpMethod || (HttpMethod = {}));
/**
 * This enum represents the available mime types
 * @author akrck02
 */
export var MimeType;
(function (MimeType) {
    MimeType["Json"] = "application/json";
    MimeType["Xml"] = "application/xml";
    MimeType["Html"] = "text/html";
    MimeType["Text"] = "text/plain";
    MimeType["Form"] = "multipart/form-data";
    MimeType["UrlEncoded"] = "application/x-www-form-urlencoded";
    MimeType["Blob"] = "application/octet-stream";
    MimeType["Pdf"] = "application/pdf";
    MimeType["Zip"] = "application/zip";
    MimeType["Mp3"] = "audio/mpeg";
    MimeType["Mp4"] = "video/mp4";
    MimeType["Png"] = "image/png";
    MimeType["Jpeg"] = "image/jpeg";
    MimeType["Gif"] = "image/gif";
    MimeType["Svg"] = "image/svg+xml";
    MimeType["Ico"] = "image/x-icon";
    MimeType["Csv"] = "text/csv";
    MimeType["Css"] = "text/css";
    MimeType["Javascript"] = "text/javascript";
    MimeType["Typescript"] = "text/typescript";
    MimeType["Webm"] = "video/webm";
    MimeType["Ogg"] = "video/ogg";
    MimeType["Ogv"] = "video/ogv";
    MimeType["Wav"] = "audio/wav";
    MimeType["Webp"] = "image/webp";
    MimeType["Woff"] = "font/woff";
    MimeType["Woff2"] = "font/woff2";
    MimeType["Ttf"] = "font/ttf";
    MimeType["Eot"] = "application/vnd.ms-fontobject";
    MimeType["Otf"] = "font/otf";
    MimeType["Xls"] = "application/vnd.ms-excel";
    MimeType["Xlsx"] = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    MimeType["Doc"] = "application/msword";
    MimeType["Docx"] = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    MimeType["Ppt"] = "application/vnd.ms-powerpoint";
    MimeType["Pptx"] = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    MimeType["Msg"] = "application/vnd.ms-outlook";
    MimeType["Rtf"] = "application/rtf";
    MimeType["Psd"] = "application/photoshop";
    MimeType["Ai"] = "application/postscript";
    MimeType["Eps"] = "application/postscript";
    MimeType["Xps"] = "application/vnd.ms-xpsdocument";
    MimeType["Swf"] = "application/x-shockwave-flash";
    MimeType["Flv"] = "video/x-flv";
    MimeType["Midi"] = "audio/midi";
    MimeType["Wma"] = "audio/x-ms-wma";
    MimeType["Wax"] = "audio/x-ms-wax";
    MimeType["Mka"] = "audio/x-matroska";
    MimeType["Mkv"] = "video/x-matroska";
    MimeType["Avi"] = "video/x-msvideo";
    MimeType["Mov"] = "video/quicktime";
    MimeType["Wmv"] = "video/x-ms-wmv";
    MimeType["M4a"] = "audio/mp4";
    MimeType["M4v"] = "video/mp4";
    MimeType["F4v"] = "video/mp4";
    MimeType["F4a"] = "audio/mp4";
    MimeType["F4b"] = "audio/mp4";
    MimeType["M4b"] = "audio/mp4";
    MimeType["M4r"] = "audio/mp4";
    MimeType["Mpga"] = "audio/mpeg";
    MimeType["Mp2"] = "audio/mpeg";
    MimeType["Mp2A"] = "audio/mpeg";
    MimeType["M2a"] = "audio/mpeg";
    MimeType["M3a"] = "audio/mpeg";
    MimeType["Oga"] = "audio/ogg";
})(MimeType || (MimeType = {}));
/**
 * This enum represents the available text encodings
 * @author akrck02
 */
export var TextEncoding;
(function (TextEncoding) {
    TextEncoding["Utf8"] = "UTF-8";
    TextEncoding["Utf16"] = "UTF-16";
    TextEncoding["Utf16be"] = "UTF-16BE";
    TextEncoding["Utf16le"] = "UTF-16LE";
    TextEncoding["Iso88591"] = "ISO-8859-1";
    TextEncoding["Iso88592"] = "ISO-8859-2";
    TextEncoding["Iso88593"] = "ISO-8859-3";
    TextEncoding["Iso88594"] = "ISO-8859-4";
    TextEncoding["Iso88595"] = "ISO-8859-5";
    TextEncoding["Iso88596"] = "ISO-8859-6";
    TextEncoding["Iso88597"] = "ISO-8859-7";
    TextEncoding["Iso88598"] = "ISO-8859-8";
    TextEncoding["Iso88599"] = "ISO-8859-9";
    TextEncoding["Iso885910"] = "ISO-8859-10";
    TextEncoding["Iso885913"] = "ISO-8859-13";
    TextEncoding["Iso885914"] = "ISO-8859-14";
    TextEncoding["Iso885915"] = "ISO-8859-15";
    TextEncoding["Iso885916"] = "ISO-8859-16";
    TextEncoding["Koi8R"] = "KOI8-R";
    TextEncoding["Koi8U"] = "KOI8-U";
    TextEncoding["Macintosh"] = "macintosh";
    TextEncoding["Windows1250"] = "windows-1250";
    TextEncoding["Windows1251"] = "windows-1251";
    TextEncoding["Windows1252"] = "windows-1252";
    TextEncoding["Windows1253"] = "windows-1253";
    TextEncoding["Windows1254"] = "windows-1254";
    TextEncoding["Windows1255"] = "windows-1255";
    TextEncoding["Windows1256"] = "windows-1256";
    TextEncoding["Windows1257"] = "windows-1257";
    TextEncoding["Windows1258"] = "windows-1258";
    TextEncoding["Xmaccyrillic"] = "x-mac-cyrillic";
    TextEncoding["Gb18030"] = "GB18030";
    TextEncoding["Big5"] = "Big5";
    TextEncoding["Shiftjis"] = "Shift_JIS";
    TextEncoding["Eucjp"] = "EUC-JP";
    TextEncoding["Iso2022jp"] = "ISO-2022-JP";
    TextEncoding["Euckr"] = "EUC-KR";
    TextEncoding["Iso2022kr"] = "ISO-2022-KR";
    TextEncoding["Ibm866"] = "IBM866";
    TextEncoding["Ibm775"] = "IBM775";
    TextEncoding["Iso885911"] = "ISO-8859-11";
    TextEncoding["Windows874"] = "windows-874";
    TextEncoding["Tis620"] = "TIS-620";
})(TextEncoding || (TextEncoding = {}));
/**
 * Make a HTTP GET request.
 * @param request The request parameters.
 * @returns The promise of a response.
 */
export async function httpGet(request) {
    request.method = HttpMethod.Get;
    return httpRequest(request);
}
/**
 * Make a HTTP POST request.
 * @param request The request parameters.
 * @returns The promise of a response.
 */
export async function httpPost(request) {
    request.method = HttpMethod.Post;
    return httpRequest(request);
}
/**
 * Make a HTTP PUT request.
 * @param request The request parameters.
 * @returns The promise of a response.
 */
export async function httpPut(request) {
    request.method = HttpMethod.Put;
    return httpRequest(request);
}
/**
 * Make a HTTP PATCH request.
 * @param request The request parameters.
 * @returns The promise of a response.
 */
export async function httpPatch(request) {
    request.method = HttpMethod.Patch;
    return httpRequest(request);
}
/**
 * Make a HTTP DELETE request.
 * @param request The request parameters.
 * @returns The promise of a response.
 */
export async function httpDelete(request) {
    request.method = HttpMethod.Delete;
    return httpRequest(request);
}
/**
 * Make a HTTP HEAD request.
 * @param request The request parameters.
 * @returns The promise of a response.
 */
export async function httpHead(request) {
    request.method = HttpMethod.Head;
    return httpRequest(request);
}
/**
 * Make a HTTP OPTIONS request.
 * @param request The request parameters.
 * @returns The promise of a response.
 */
export async function httpOptions(request) {
    request.method = HttpMethod.Options;
    return httpRequest(request);
}
/**
 * Make a HTTP request.
 * @param request The request parameters.
 * @returns The promise of a response.
 */
function httpRequest(request) {
    let options = {
        method: request.method || HttpMethod.Get,
        headers: {
            "Content-type": `${request.contentType || "application/json"};charset=${request.charset || "UTF-8"}`,
            "mode": "cors",
            "Sec-Fetch-Site": "cross-site",
        },
    };
    request.headers && Object.assign(options.headers, request.headers);
    if (HttpMethod.Get !== request.method) {
        if (request.parameters instanceof FormData) {
            options["body"] = request.parameters;
            options.headers["Content-type"] = `multipart/form-data;charset=${request.charset || "UTF-8"}`;
        }
        else {
            options["body"] = JSON.stringify(request.parameters);
        }
    }
    return fetch(request.url, options);
}
/**
 * Handle response status.
 * @param response The response to Handle.
 * @param statusHandlers The map of status codes with handlers.
 * @param defaultStatusHandler The default status handler.
 */
export async function handleResponseStatus(response, statusHandlers, defaultStatusHandler) {
    if (true == statusHandlers.has(response.status)) {
        await statusHandlers.get(response.status)(response);
        return;
    }
    if (undefined != defaultStatusHandler)
        await defaultStatusHandler(response);
    else
        console.error(`unhandled status code ${response.status} for ${response.url}`);
}
