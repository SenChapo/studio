
'use client';

import React from 'react';

interface FormattedTextRendererProps {
  content: string;
  className?: string;
}

export const FormattedTextRenderer: React.FC<FormattedTextRendererProps> = ({ content, className }) => {
  const renderBoldText = (textSegment: string) => {
    // Regex to split by **bolded text**, keeping the delimiters for processing
    const parts = textSegment.split(/(\*\*.*?\*\*)/g); 
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Remove the ** and render the content as strong
        return <strong key={`bold-${index}`}>{part.substring(2, part.length - 2)}</strong>;
      }
      // Return non-bold parts as is
      return part;
    }).filter(part => typeof part === 'string' ? part.length > 0 : React.isValidElement(part)); // Filter out empty strings but keep React elements
  };

  // Split the entire content by one or more newlines (to form paragraphs)
  const paragraphs = content.split(/\n\s*\n/).map((paragraphText, index) => {
    const trimmedParagraph = paragraphText.trim();
    if (trimmedParagraph === '') return null; // Skip empty paragraphs

    return (
      <p key={`p-${index}`} className="whitespace-pre-wrap leading-relaxed">
        {renderBoldText(trimmedParagraph)}
      </p>
    );
  }).filter(Boolean); // Remove any nulls (empty paragraphs)

  // If, after splitting, there are no paragraphs but the original content was not empty,
  // treat the whole content as a single paragraph.
  if (paragraphs.length === 0 && content.trim() !== '') {
    return (
      <div className={className}>
        <p className="whitespace-pre-wrap leading-relaxed">
          {renderBoldText(content.trim())}
        </p>
      </div>
    );
  }

  return <div className={className}>{paragraphs}</div>;
};
