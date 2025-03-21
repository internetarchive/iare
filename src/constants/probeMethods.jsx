// ParseMethods dictate how the article is parsed.
// Each parsing method makes a different IARI endpoint call
export const ProbeMethods = {
    PROBE_VERIFYI: {
        // Uses Chris' from New York's verifyi.cc thing to generate info data on link.
        //
        key: 'PROBE_VERIFYI',
        name: 'Verifyi',
        caption: 'Verifyi reliability data',
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

    PROBE_TRUST: {
        key: 'PROBE_TRUST',
        name: 'Trust Project',
        caption: 'The Trust Project reliability data',
        endpoint: '/probe/trust-project',
        /*
        endpoint params: url, probe_method=default, (options)
         */
    },


    PROBE_DEFAULT: {
        // Use default probe method. Let IARI decide what that is.
        // Could be All probes
        key: 'PROBE_DEFAULT',
        caption: 'Default IARI reliability data',
        endpoint: '/probe/',
        /*
        endpoint params: url, probe_method=default, (options)
         */
    },
}