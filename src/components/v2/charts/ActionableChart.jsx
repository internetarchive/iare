import {ACTIONABLE_FILTER_MAP} from "../../../constants/actionableMap.jsx";
import FilterButtons from "../../FilterButtons.jsx";
import {ACTIONS_IARE} from "../../../constants/actionsIare.jsx";

function ActionFilters({
    // TODO we can remove this ActionFilters component and use FilterButtons directly in ActionableChart
                           filterSet = null,
                           filterRender,
                           flock = [],
                           onAction,
                           options = {},
                           currentFilterName = '',
                           tooltipId = null,
                           className = null
                       }) {
    const handleActionable = (actionable) => {
        onAction({
            action: ACTIONS_IARE.SET_ACTIONABLE_FILTER.key, value: actionable,
        })
    }

    return <FilterButtons
        flock={flock}  // flock set to count filters against
        filterMap={filterSet}
        onClick={handleActionable}
        caption={null}
        currentFilterName={currentFilterName}  // sets "pressed" default selection
        className={className}
        tooltipId={tooltipId}
        onRender={filterRender}  // how to render each button
    />

}

const ActionableChart = ({pageData, options, onAction, currentState = "", tooltipId=null}) => {

    const renderActionableButton = (props) => {
        /*
        callback for button render function of <FilterButton>
        expects:
            props.filter.caption
            props.filter.count
        */

        // TODO put in some element data for tooltip, like filter.desc
        // TODO Question: where does tool tip come from? is it generic tooltip for the page?
        return <>
            <div>{props.filter?.caption}</div>
            <div className={'filter-count'}>{
                props.filter?.count
                    ? props.filter.count + ' ' +
                    (  // 1 or more
                        props.filter.count === 1
                            ? "item"
                            : "items"
                    )
                    : "No items" // 0 or null items
            }</div>
        </>
    }

    return <>
        <div className={"row"}>
            <div className={"col-12"}>
                <ActionFilters
                    filterSet={ACTIONABLE_FILTER_MAP}
                    filterRender={renderActionableButton}
                    flock={pageData.urlArray}
                    onAction={onAction}
                    options={{}}
                    currentFilterName={currentState}
                    className={'url-actionable-buttons'}
                    tooltipId={tooltipId}
                />
            </div>
        </div>

    </>

}

export default ActionableChart