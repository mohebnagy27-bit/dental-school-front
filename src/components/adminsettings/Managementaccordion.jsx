import React, { useState } from 'react';

/**
 * ManagementAccordion
 * Wraps ManagementSection children and enforces single-open behaviour.
 * Each child must have a `sectionId` prop. This component injects
 * `isOpen` and `onToggle` into each child via React.cloneElement.
 */
export default function ManagementAccordion({ children }) {
  const [openId, setOpenId] = useState(null);

  const toggle = (id) =>
    setOpenId((prev) => (prev === id ? null : id));

  return (
    <div className="stg-accordion">
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child, {
          isOpen:   child.props.sectionId === openId,
          onToggle: () => toggle(child.props.sectionId),
        });
      })}
    </div>
  );
}