import React, {useState, cloneElement, isValidElement} from "react";
import useIsBrowser from "@docusaurus/useIsBrowser";
import {
  useScrollPositionBlocker,
  duplicates,
  useTabGroupChoice,
} from "@docusaurus/theme-common/internal";
import clsx from "clsx";
import styles from "./styles.module.css";

// Custom function adapted from Temporal documentation
// Copyright (c) 2022 Temporal Technologies Inc. All rights reserved.
// Copyright (c) 2017 Uber Technologies, Inc.
function updateTabLink(val,topic) {
  const url = window.location.href;
  const parts = url.split("#");
  if (topic == undefined) {
    history.replaceState({}, "", `?lang=${val}`);
  }
  else {
  history.replaceState({}, "", `?tab=${val}#${topic}`);
  }
}
//End customization


function isTabItem(comp) {
  return typeof comp.props.value !== "undefined";
}

function TabsComponent(props) {
  const {
    lazy,
    block,
    defaultValue: defaultValueProp,
    values: valuesProp,
    groupId,
    className,
  } = props;
  const children = React.Children.map(props.children, (child) => {
    if (isValidElement(child) && isTabItem(child)) {
      return child;
    } // child.type.name will give non-sensical values in prod because of
    // minification, but we assume it won't throw in prod.

    throw new Error(
      `Docusaurus error: Bad <Tabs> child <${
        // @ts-expect-error: guarding against unexpected cases
        typeof child.type === "string" ? child.type : child.type.name
      }>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`
    );
  });
  const values =
    valuesProp ?? // Only pick keys that we recognize. MDX would inject some keys by default
    children.map(({props: {value, label, attributes}}) => ({
      value,
      label,
      attributes,
    }));
  const dup = duplicates(values, (a, b) => a.value === b.value);

  if (dup.length > 0) {
    throw new Error(
      `Docusaurus error: Duplicate values "${dup
        .map((a) => a.value)
        .join(", ")}" found in <Tabs>. Every value needs to be unique.`
    );
  } // When defaultValueProp is null, don't show a default tab

  const defaultValue =
    defaultValueProp === null
      ? defaultValueProp
      : defaultValueProp ??
        children.find((child) => child.props.default)?.props.value ??
        children[0]?.props.value;

  if (defaultValue !== null && !values.some((a) => a.value === defaultValue)) {
    throw new Error(
      `Docusaurus error: The <Tabs> has a defaultValue "${defaultValue}" but none of its children has the corresponding value. Available values are: ${values
        .map((a) => a.value)
        .join(
          ", "
        )}. If you intend to show no default tab, use defaultValue={null} instead.`
    );
  }

  const {tabGroupChoices, setTabGroupChoices} = useTabGroupChoice();
  const [selectedValue, setSelectedValue] = useState(defaultValue);
  const tabRefs = [];
  const {blockElementScrollPositionUntilNextRender} =
    useScrollPositionBlocker();

  if (groupId != null) {
    const relevantTabGroupChoice = tabGroupChoices[groupId];

    if (
      relevantTabGroupChoice != null &&
      relevantTabGroupChoice !== selectedValue &&
      values.some((value) => value.value === relevantTabGroupChoice)
    ) {
      setSelectedValue(relevantTabGroupChoice);
    }
  }

  const handleTabChange = (event) => {
    const newTab = event.currentTarget;
    const newTabIndex = tabRefs.indexOf(newTab);
    const newTabValue = values[newTabIndex].value;

    updateTabLink(newTabValue, groupId);

    if (newTabValue !== selectedValue) {
      blockElementScrollPositionUntilNextRender(newTab);
      setSelectedValue(newTabValue);

      if (groupId != null) {
        setTabGroupChoices(groupId, newTabValue);
      }
    }
  };

  const handleKeydown = (event) => {
    let focusElement = null;

    switch (event.key) {
      case "ArrowRight": {
        const nextTab = tabRefs.indexOf(event.currentTarget) + 1;
        focusElement = tabRefs[nextTab] || tabRefs[0];
        break;
      }

      case "ArrowLeft": {
        const prevTab = tabRefs.indexOf(event.currentTarget) - 1;
        focusElement = tabRefs[prevTab] || tabRefs[tabRefs.length - 1];
        break;
      }

      default:
        break;
    }

    focusElement?.focus();
  };

  return (
    <div className={clsx("tabs-container", styles.tabList)}>
      <ul
        role="tablist"
        aria-orientation="horizontal"
        className={clsx(
          "tabs",
          {
            "tabs--block": block,
          },
          className
        )}
      >
        {values.map(({value, label, attributes}) => (
          <li
            role="tab"
            tabIndex={selectedValue === value ? 0 : -1}
            aria-selected={selectedValue === value}
            key={value}
            ref={(tabControl) => tabRefs.push(tabControl)}
            onKeyDown={handleKeydown}
            onFocus={handleTabChange}
            onClick={handleTabChange}
            {...attributes}
            className={clsx(
              "tabs__item",
              styles.tabItem,
              attributes?.className,
              {
                "tabs__item--active": selectedValue === value,
              }
            )}
          >
            {label ?? value}
          </li>
        ))}
      </ul>

      {lazy ? (
        cloneElement(
          children.filter(
            (tabItem) => tabItem.props.value === selectedValue
          )[0],
          {
            className: "margin-top--md",
          }
        )
      ) : (
        <div className="margin-top--md">
          {children.map((tabItem, i) =>
            cloneElement(tabItem, {
              key: i,
              hidden: tabItem.props.value !== selectedValue,
            })
          )}
        </div>
      )}
    </div>
  );
}

export default function Tabs(props) {
  const isBrowser = useIsBrowser();
  return (
    <TabsComponent // Remount tabs after hydration
      // Temporary fix for https://github.com/facebook/docusaurus/issues/5653
      key={String(isBrowser)}
      {...props}
    />
  );
}
