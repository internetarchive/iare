/*
get section names for page
new copy of url array
- section array (link could be in more than 1 section)
- has_archive boolean
- urlObj pointer to original url object
 */


export function getTapestryData(pageData: any /*urlArray: Array<any>*/): null | any {
    // TODO: set array parameter type to defined url data

    const config = {
        xMediaSize: 400,
        yMediaSize: 300,
        xMediaGap: 10,
        yMediaGap: 10,
        xSectionGap: 50,
        ySectionGap: 50,
    }
    const nextOrigX = 0
    const nextOrigY = 0

    // traverse all url objects in cleanArray
    // add url pointer to section list

    // when sections are "defined",
    // traverse section names list for page
    // as each section encountered:
    // - determine grid dimensions and location
    // - output section header
    // - output list of section url's as array of url objects

    // prepare for final tapestry output:
    // - header element with page title
    // - array of sections (groupos)
    //   - each section (group):
    //     - append to link array of section (group)
    //     - section header: { title:string }
    //     - array of tapestry url objects
    // sample:


    // 1. prepare url object array copy
    // 2. prepare section list
    //      - create objects with {
    //          name, count,
    //          xgrid, ygrid,
    //          sizeX sizeY
    //          gapX gapY
    //          origX origY
    //          curX curY

    // define:
    // - xMediaGap, yMediaGap
    // - xSectionGap, ySectionGap

    // make sure:
    // - when making new section, give xspace (and yspace?) to origin of last one
    //      - "size" of section: origX + (xgrid * sizeX) + ((xgrid - 1) * gap)
    //      - new xorg = (prev section xprg) + (prev section xsize) + xSectionGap
    //      - new yorg = (prev section yprg) + 0
    //          (for now - all will be horizontally aligned)
    //          (later we will increment yOrg based on y horiz of largest ysize of "row")

    // once we have xOrg and yOrg of new sectionTap:
    // calculate orig
    //  - xOrg

    function gatherData(pageData) {

        const getNewId = (i: number): string => {
            const template = "00000000-0000-0000-0000-000000000000"
            return template.slice(0,-String(i).length) + i
        }

        const sectionNames = pageData.section_names ?? []

        const sections = sectionNames.map( (s, i)=> {
            const newId = getNewId(i)
            return {
                groupId: newId,
                name: s,
                count: 0,
                origX: 0,
                origY: 0,
                xGrid: 0,
                yGrid: 0,
                xSize: 0,
                ySize: 0,
            }
        })

        const links = pageData.urlArray.map( (u , i)=> {
            const linkObj = {
                hasArchive: !!(u?.url_archive),
                sections: u.reference_summary.sections,
                urlObj: u
            }

            return linkObj
        })

        return { sections, links }
    }


    /*
    - for each link in links
        - for each section in link.sections
            - add
            - increment section.count
    - for each section:
        - xOrg = nextOrigX, yOrg = nextOrigY
        - calculate xGrid and yGrid based on count
            - xGrid:yGrid ratio should be as close to 4:3 ratio as possible
        - calc xSize and ySize
            - xSize: xGrid * (xMediaSize + xMediaGap) - xMediaGap
            - ySize: yGrid * (yMediaSize + yMediaGap) - yMediaGap
        - nextOrigX = nextOrigX + xSize
        - nextOrigY = nextOrigY + ySize

     */
    function processData(sections, links) {


    }

    /*

    - for each section in sections
        - for each link in section.links
     */
    function renderData(sections, links) {
        // rendered sections
        // rendered items
        // output with outer header data

        const sectionMarkup = sections.map(section => {
            return {
                "id": section.groupId,
                "color": null,
                "hasBorder": true,
                "hasBackground": true
            }
        })

        const linkMarkup = links.map(link => {

            return {
                "id": link.urlObj.url_id,
                "color": null,
                "hasBorder": true,
            }
        })
    }

    if (!pageData?.urlArray) return null

    const { sections, links } = gatherData(pageData)

    processData(sections, links)

    return renderData(sections, links)

// // create a "currentItems" array
// const currentItems: any[] = [];
//
// // create array with sortable fields and data
// urlArray.forEach(u => {
//     if (u.url_archive) {
//         // place section info in there
//
//         // if no archive, text block of what it is
//     }
//     const section = u.section_id
//     const myU = {
//         hasArchive: u?.url_archive,
//         section: section,
//         urlObj: u
//     }
//     currentItems.push(myU);
// });
//
// // after all done, group/sort by section then index place
// //  (custom sort function)
// // create new group when sectionId changes
// //  name group
// // set new origin
// //  2 columns 4 wide each
// // this outputs directly
// return currentItems.length > 0 ? currentItems : null;
}

