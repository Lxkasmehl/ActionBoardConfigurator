export const generateTextComponent = () => {
  return `
    import { Typography } from '@mui/joy';
    import { useEffect, useState } from 'react';
    import { useSendRequest } from '../hooks/useSendRequest';

    export default function TextComponent({component}) {
      const [text, setText] = useState(component.props.text);
      const sendRequest = useSendRequest();

      // Function to extract values from text
      const extractValues = (text) => {
        const regex = /\\[\\[(.*?)\\]\\]/g;
        const matches = [...text.matchAll(regex)];
        return matches.map((match) => match[1]);
      };

      // Function to update text with fetched values
      const updateTextWithFetchedValues = (text, fetchedValues) => {
        let updatedText = text;
        Object.entries(fetchedValues).forEach(([originalValue, newValue]) => {
          updatedText = updatedText.replace(
            \`[[\${originalValue}]]\`,
            \`[[\${newValue}]]\`,
          );
        });
        return updatedText;
      };

      // Effect to fetch values on mount
      useEffect(() => {
        const fetchValues = async () => {
          const values = extractValues(text);
          if (values.length === 0) return;

          const configEntriesToFetch = values
            .filter((value) => component.props.textConfigEntries?.[value])
            .map((value) => {
              const configEntry = component.props.textConfigEntries[value];
              return [
                value,
                {
                  entityName: Object.keys(configEntry.configEntries[0][1])[0],
                  selectedProperties:
                    configEntry.configEntries[0][1][
                      Object.keys(configEntry.configEntries[0][1])[0]
                    ].selectedProperties,
                  filter:
                    configEntry.configEntries[0][1][
                      Object.keys(configEntry.configEntries[0][1])[0]
                    ].filter,
                },
              ];
            });

          if (configEntriesToFetch.length === 0) return;

          try {
            const results = await sendRequest(null, configEntriesToFetch);
            const fetchedValues = {};

            results.forEach((result, index) => {
              const value = values[index];
              const configEntry = component.props.textConfigEntries[value];
              if (result.d.results && result.d.results.length > 0) {
                const selectedProperty = configEntry.selectedProperty;
                const selectedValue = configEntry.selectedValue;

                const matchingResult = result.d.results.find(
                  (r) => r[selectedProperty] === selectedValue.value,
                );

                if (matchingResult) {
                  fetchedValues[value] = matchingResult[selectedProperty];
                }
              }
            });

            const updatedText = updateTextWithFetchedValues(text, fetchedValues);
            if (updatedText !== text) {
              setText(updatedText);
            }
          } catch (error) {
            console.error('Error fetching values:', error);
          }
        };

        fetchValues();
      }, []); // Only run on mount

      return (
        <Typography level={component.props.level} sx={{ marginBottom: '2rem' }}>
          {text}
        </Typography>
      );
    }
  `;
};
