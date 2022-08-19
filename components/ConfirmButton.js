/*
 * ConfirmButton
 *
 * Provides a Button component linked with a Dialog that confirms the assocaited button action
 */
import React, { useState } from 'react';
import { Dialog, Button, Portal, Subheading } from 'react-native-paper';
import PropTypes from 'prop-types';
import { styles } from '../styles/CourtTimerStyles';

function ConfirmButton(props) {
  const { onPress, confirmTitle, confirmText, confirmLabel, children, color } = props;
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <Portal>
        <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
          <Dialog.Title>{confirmTitle}</Dialog.Title>
          <Dialog.Content>
            <Subheading>{confirmText}</Subheading>
          </Dialog.Content>
          <Dialog.Actions style={styles.spacedButtonBar}>
            <Button onPress={onPress} mode="text" color={color}>{confirmLabel}</Button>
            <Button onPress={() => setShowDialog(false)} mode="contained">Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Button color={color} onPress={() => setShowDialog(true)}>{children}</Button>
    </>
  );
}

ConfirmButton.propTypes = {
  confirmTitle: PropTypes.string,
  confirmText: PropTypes.string,
  confirmLabel: PropTypes.string,
  onPress: PropTypes.func,
  children: PropTypes.elementType,
  color: PropTypes.string,
};

ConfirmButton.defaultProps = {
  confirmTitle: 'CONFIRM',
  confirmText: 'Are you sure?',
  confirmLabel: 'Proceed',
  onPress: () => {},
  children: null,
  color: null,
};

export default ConfirmButton;
