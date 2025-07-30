import React from 'react';
import { Text } from 'react-native';

const AppText = (props) => (
  <Text {...props} style={[{ fontFamily: 'DMSans-Regular' }, props.style]}>
    {props.children}
  </Text>
);

export default AppText; 