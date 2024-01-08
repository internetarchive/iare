import {ACTIONABLE_FILTER_MAP} from "../../../constants/actionableMap";
import FilterButtons from "../../FilterButtons";
import {Tooltip as MyTooltip} from "react-tooltip";


function ActionFilters({
                           filterSet = null,
                           filterRender,
                           flock = [],
                           onAction,
                           options = {},
                           currentFilterName = '',
                           tooltipId = '',
                           className = null
                       }) {
    const handleActionable = (actionable) => {
        onAction({
            action: "setActionableFilter", value: actionable,
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

const ActionableChart = ({pageData, options, onAction, currentState = ""}) => {

    const localized = {
        "actionable": "Actionable",
        "actionable_subtitle": " - Show Links from Citations that can be improved right now"
    }

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
            <div className={'filter-count'}>{props.filter?.count} items</div>
        </>
    }

    return <>
        {/*<h4 className={"section-caption"}>{localized.actionable}<span*/}
        {/*    className={"inferior"}>{localized.actionable_subtitle}</span></h4>*/}

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
                    tooltipId={'tooltip-actionable_chart'}
                />
            </div>
        </div>

        <MyTooltip id="tooltip-actionable_chart"
                   float={true}
                   closeOnEsc={true}
                   delayShow={420}
                   variant={"info"}
                   noArrow={true}
                   offset={5}
                   className={"tooltip-actionable"}
        />

    </>

}

export default ActionableChart