/*
regex to extract
API = "http://18.217.22.248/v1/get-statistics?refresh=false&lang={lang}&site={site}&title={title}"

WIKIURL = re.compile(r"https?://(?P<lang>\w+)\.(?P<site>\w+)\.org/wiki/(?P<title>\S+)")

m = WIKIURL.match(url)
if m:
apiurl = API.format(**m.groupdict())

Home
 */

// export const regexWikiUrl = new RegExp("https?://(?<lang>\w+)\.(?<site>\w+)\.org/wiki/(?<title>\S+)", "g");
// eslint-disable-next-line
//export const regexWikiUrl = new RegExp("https?://(?<lang>\w+)\.(?<site>\w+)\.org/wiki/(?<title>\S+)", "g");
export const REGEX_WIKIURL = new RegExp(/https?:\/\/(\w+)\.(\w+)\.org\/(\S+)/);
