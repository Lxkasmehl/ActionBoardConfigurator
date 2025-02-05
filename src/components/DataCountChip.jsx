import React from 'react';
import { Chip } from '@nextui-org/react';

export default function DataCountChip({ chipcontent }) {
  return (
    <div className="flex gap-4">
      <Chip color="primary">{chipcontent}</Chip>
    </div>
  );
}
