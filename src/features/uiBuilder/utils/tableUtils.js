export const generateNewValue = (type) => {
  let start, end, texts;
  switch (type) {
    case 'number':
      return Math.floor(Math.random() * 1000);
    case 'boolean':
      return Math.random() > 0.5;
    case 'date':
      start = new Date(2020, 0, 1);
      end = new Date();
      return new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime()),
      )
        .toISOString()
        .split('T')[0];
    case 'text':
      texts = [
        'Sample Text',
        'Example Data',
        'Random Value',
        'Test Entry',
        'Demo Content',
      ];
      return texts[Math.floor(Math.random() * texts.length)];
    default:
      return '';
  }
};

export const getInitialDummyData = () => [
  {
    'User id': 1001,
    'Employee Name': 'John Smith',
    Gender: 'M',
    Country: 'USA',
  },
  {
    'User id': 1002,
    'Employee Name': 'Sarah Johnson',
    Gender: 'F',
    Country: 'Canada',
  },
];
