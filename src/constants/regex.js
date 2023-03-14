/*
regex to extract
API = "http://18.217.22.248/v1/get-statistics?refresh=false&lang={lang}&site={site}&title={title}"
WIKIURL = re.compile(r"https?://(?P<lang>\w+)\.(?P<site>\w+)\.org/wiki/(?P<title>\S+)")
m = WIKIURL.match(url)
if m:
apiurl = API.format(**m.groupdict())
Home
 */

// eslint-disable-next-line
export const REGEX_WIKIURL = new RegExp(/https?:\/\/(?<lang>\w+)\.(?<site>\w+)\.org\/wiki\/(?<title>\S+)/);
