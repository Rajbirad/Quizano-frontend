import React from "react";

// Type hinting for structured content
type SectionItem = {
  label?: string;
  description?: string;
};

type FlowStep = {
  step: number;
  title: string;
  description: string;
};

type Section = {
  type?: string;
  heading: string;
  icon?: string;
  paragraph?: string;
  content?: string;
  items?: SectionItem[] | string[];
  steps?: FlowStep[];
  columns?: string[];
  rows?: string[][];
};

type StructuredContentProps = {
  title: string;
  sections: Section[];
};

// Simple function to render content with proper formatting
const renderSimpleContent = (text: string) => {
  // Split into lines and clean each line
  const lines = text.split('\n').filter(line => line.trim() !== '');
  const elements: React.ReactNode[] = [];
  
  let currentList: React.ReactNode[] = [];
  let isInList = false;
  let listType: 'numbered' | 'bullet' | null = null;
  
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    // Check for numbered lists (1. 2. etc.)
    const numberedMatch = trimmed.match(/^(\d+)\.\s*(.+)$/);
    if (numberedMatch) {
      // If we're switching from bullet to numbered, close the bullet list first
      if (isInList && listType === 'bullet') {
        elements.push(
          <ul key={`list-${elements.length}`} className="space-y-0.5 mb-2 ml-12 pl-2">
            {currentList}
          </ul>
        );
        currentList = [];
      }
      
      if (!isInList || listType !== 'numbered') {
        currentList = [];
        isInList = true;
        listType = 'numbered';
      }
      
      const content = numberedMatch[2].replace(/\*\*([^*]+)\*\*/g, '$1'); // Remove ** 
      currentList.push(
        <li key={`num-${index}`} className="flex items-start gap-1 mb-1">
          <span className="w-5 flex-shrink-0 text-gray-800 dark:text-gray-200 font-normal">
            {numberedMatch[1]}.
          </span>
          <span className="text-gray-800 dark:text-gray-200 leading-relaxed font-bold">{content}</span>
        </li>
      );
      return;
    }
    
    // Check for bullet lists (- or •)
    const bulletMatch = trimmed.match(/^[-•]\s*(.+)$/);
    if (bulletMatch) {
      // If we're switching from numbered to bullet, close the numbered list first
      if (isInList && listType === 'numbered') {
        elements.push(
          <ul key={`list-${elements.length}`} className="space-y-0.5 mb-2 ml-6 pl-2">
            {currentList}
          </ul>
        );
        currentList = [];
      }
      
      if (!isInList || listType !== 'bullet') {
        currentList = [];
        isInList = true;
        listType = 'bullet';
      }
      
      const content = bulletMatch[1].replace(/\*\*([^*]+)\*\*/g, '$1'); // Remove ** formatting
      currentList.push(
        <li key={`bullet-${index}`} className="flex items-start gap-2 mb-1">
          <div className="w-1.5 h-1.5 bg-gray-800 dark:bg-gray-200 rounded-full mt-2.5 flex-shrink-0" />
          <span className="text-gray-800 dark:text-gray-200 leading-relaxed">{content}</span>
        </li>
      );
      return;
    }
    
    // If we were in a list but hit a non-list item, close the list
    if (isInList) {
      const listClass = listType === 'bullet' ? "space-y-0.5 mb-2 ml-12 pl-2" : "space-y-0.5 mb-2 ml-6 pl-2";
      elements.push(
        <ul key={`list-${elements.length}`} className={listClass}>
          {currentList}
        </ul>
      );
      currentList = [];
      isInList = false;
      listType = null;
    }
    
    // Regular paragraph
    if (trimmed) {
      const content = trimmed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>'); // Convert ** to bold
      elements.push(
        <p key={`para-${index}`} className="text-gray-800 dark:text-gray-200 leading-relaxed mb-2 text-base" dangerouslySetInnerHTML={{ __html: content }} />
      );
    }
  });
  
  // Close any remaining list
  if (isInList && currentList.length > 0) {
    const listClass = listType === 'bullet' ? "space-y-0.5 mb-2 ml-12 pl-2" : "space-y-0.5 mb-2 ml-6 pl-2";
    elements.push(
      <ul key={`list-final`} className={listClass}>
        {currentList}
      </ul>
    );
  }
  
  return elements;
};

const renderSectionBody = (section: Section) => {
  const { type, items, content, steps, columns, rows, paragraph } = section;

  const paragraphEl = paragraph ? (
    <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3 text-sm italic">{paragraph}</p>
  ) : null;

  // bullet_list: items is array of { label, description }
  if ((type === 'bullet_list' || type === 'numbered_list') && Array.isArray(items)) {
    return (
      <>
        {paragraphEl}
        <ul className="space-y-2 ml-2">
          {items.map((item: any, i: number) => (
            <li key={i} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2.5 flex-shrink-0" />
              <span className="text-gray-800 dark:text-gray-200 leading-relaxed">
                {item.label && <strong>{item.label}: </strong>}
                {item.description ?? (typeof item === 'string' ? item : '')}
              </span>
            </li>
          ))}
        </ul>
      </>
    );
  }

  // flow_step: steps is array of { step, title, description }
  if (type === 'flow_step' && Array.isArray(steps)) {
    return (
      <>
        {paragraphEl}
        <ol className="space-y-3 ml-2">
          {steps.map((s: FlowStep, i: number) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-5 text-gray-500 font-semibold text-sm pt-0.5">
                {s.step}.
              </span>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200 leading-snug">{s.title}</p>
                {s.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mt-0.5">{s.description}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </>
    );
  }

  // table: columns + rows
  if (type === 'table' && Array.isArray(columns) && Array.isArray(rows)) {
    return (
      <>
        {paragraphEl}
        <div className="overflow-x-auto rounded-lg border-2 border-gray-300 dark:border-gray-600">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                {columns.map((col, i) => (
                  <th key={i} className="px-4 py-3 text-left font-semibold text-gray-800 dark:text-gray-200 border-b-2 border-r border-gray-300 dark:border-gray-600 last:border-r-0">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(() => {
                // Compute rowspan for first column (group consecutive identical values)
                const rowspans: number[] = rows.map(() => 0);
                for (let i = 0; i < rows.length; i++) {
                  if (i === 0 || rows[i][0] !== rows[i - 1][0]) {
                    let span = 1;
                    while (i + span < rows.length && rows[i + span][0] === rows[i][0]) span++;
                    rowspans[i] = span;
                  }
                }
                // Detect last row of each group for thick divider
                const isGroupEnd: boolean[] = rows.map((row, ri) =>
                  ri === rows.length - 1 || rows[ri + 1][0] !== row[0]
                );
                return rows.map((row, ri) => {
                  const groupBorder = isGroupEnd[ri]
                    ? 'border-b-2 border-gray-300 dark:border-gray-600'
                    : 'border-b border-gray-100 dark:border-gray-800';
                  return (
                    <tr key={ri} className="bg-white dark:bg-gray-900">
                      {rowspans[ri] > 0 && (
                        <td
                          rowSpan={rowspans[ri]}
                          className="px-4 py-2 text-gray-700 dark:text-gray-300 border-b-2 border-r border-gray-300 dark:border-gray-600 font-medium align-middle"
                        >
                          {row[0]}
                        </td>
                      )}
                      {row.slice(1).map((cell, ci, arr) => (
                        <td key={ci} className={`px-4 py-2 text-gray-700 dark:text-gray-300 ${groupBorder} ${ci < arr.length - 1 ? 'border-r border-gray-200 dark:border-gray-700' : ''}`}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  // key_insights: items is array of strings
  if (type === 'key_insights' && Array.isArray(items)) {
    return (
      <ul className="space-y-2 ml-2">
        {items.map((item: any, i: number) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-primary mt-0.5 flex-shrink-0">💡</span>
            <span className="text-gray-800 dark:text-gray-200 leading-relaxed">
              {typeof item === 'string' ? item : item.label ?? JSON.stringify(item)}
            </span>
          </li>
        ))}
      </ul>
    );
  }

  // conclusion / fallback: plain content string
  if (content) {
    return (
      <>
        {paragraphEl}
        <div className="space-y-2">{renderSimpleContent(content)}</div>
      </>
    );
  }

  return paragraphEl;
};

const StructuredContent: React.FC<StructuredContentProps> = ({ title, sections }) => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 shadow-lg rounded-2xl space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white pb-2 mb-6 text-center">
        {title}
      </h1>

      {sections.map((section, index) => (
        <div key={index} className="space-y-2 pb-3">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-3">
            {section.icon && <span className="text-xl">{section.icon}</span>}
            {section.heading}
          </h2>
          <div className="ml-8">
            {renderSectionBody(section)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StructuredContent;
