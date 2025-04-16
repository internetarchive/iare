// ParseMethods dictate how the article is parsed.
// Each parsing method makes a different IARI endpoint call
export const ProbeDefs = {
    verifyi: {
        // Uses Chris' from New York's verifyi.cc thing to generate info data on link.
        //
        key: 'verifyi',
        name: 'Verifyi',
        caption: 'Verifyi reliability data',
        short_caption: 'Ve',
        endpoint: '/probe/verifyi',
        /*
        endpoint params: url, (probe_method=verifyi,) (options)
         */
        /*
        shall we have something like:
        call_function: ()=> () => {
            // calls probe, waits, responds
            //
            // all right here in the probe definition...
            //
            // the client could still use endpoint themselves
        }

         */
    },

    trust_project: {
        key: 'trust_project',
        name: 'Trust Project',
        caption: 'The Trust Project reliability data',
        short_caption: 'Tr',
        endpoint: '/probe/trust-project',
        /*
        endpoint params: url, probe_method=default, (options)
         */
    },


    default: {
        // Use default probe method. Let IARI decide what that is.
        // Could be All probes
        key: 'default',
        caption: 'Default IARI reliability data',
        short_caption: 'Xx',
        endpoint: '/probe/',
        /*
        endpoint params: url, probe_method=default, (options)
         */
    },
}