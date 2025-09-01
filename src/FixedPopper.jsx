import { Popper } from '@mui/material';

export const FixedPopper = (props) => {
  console.log('Custom PopperComponent props:', props);
  return (
    <Popper
      {...props}
      modifiers={[
        {
          name: 'insetFix',
          enabled: true,
          phase: 'write',
          fn: ({ state }) => {
            if (state.elements.popper) {
              console.log('Applying insetFix modifier');
              state.elements.popper.style.inset = '0px auto auto 0px';
              console.log(
                'Inset style after set:',
                state.elements.popper.style.inset,
              );
            }
          },
        },
      ]}
    />
  );
};
