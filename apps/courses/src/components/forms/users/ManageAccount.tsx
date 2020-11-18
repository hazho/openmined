import React, { useRef, useState } from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  BoxProps,
  Button,
  Flex,
  Heading,
  Icon,
  Link,
  Text,
} from '@chakra-ui/core';
import * as yup from 'yup';
import { useAuth, useUser } from 'reactfire';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

import Form from '../_form';
import { validEmail } from '../_validation';
import { emailField } from '../_fields';

import useToast, { toastConfig } from '../../Toast';
import { handleErrors } from '../../../helpers';

interface ManageAccountFormProps extends BoxProps {
  callback?: () => void;
  onAddPassword: () => void;
}

export default ({
  callback,
  onAddPassword,
  ...props
}: ManageAccountFormProps) => {
  const user = useUser();
  const auth = useAuth();
  const toast = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const onClose = () => setIsOpen(false);
  const cancelRef = useRef();

  // TODO: Patrick, find a way to centralize this logic since it's done twice in the codebase
  const githubProvider = new useAuth.GithubAuthProvider();

  githubProvider.addScope('public_repo');
  githubProvider.addScope('read:user');
  githubProvider.addScope('user.email');

  const onSuccess = () => {
    toast({
      ...toastConfig,
      title: 'Email address updated',
      description: 'We have successfully updated your email address.',
      status: 'success',
    });
    if (callback) callback();
  };

  const onLinkSuccess = (provider) => {
    toast({
      ...toastConfig,
      title: 'Account linked',
      description: `We have successfully linked this account to ${provider}.`,
      status: 'success',
    });
    if (callback) callback();
  };

  const onUnlinkSuccess = (provider) => {
    toast({
      ...toastConfig,
      title: 'Account unlinked',
      description: `We have successfully unlinked this account from ${provider}.`,
      status: 'success',
    });
    if (callback) callback();
  };

  const onDeleteSuccess = () => {
    toast({
      ...toastConfig,
      title: 'Account deleted',
      description: 'We hate to see you go but wish you all the best!',
      status: 'success',
    });
    if (callback) callback();
  };

  const onSubmit = ({ email }) =>
    auth.currentUser
      .updateEmail(email)
      .then(() =>
        auth.currentUser
          .sendEmailVerification()
          .then(onSuccess)
          .catch((error) => handleErrors(toast, error))
      )
      .catch((error) => handleErrors(toast, error));

  const onLinkGithub = () =>
    auth.currentUser
      .linkWithPopup(githubProvider)
      .then(() => onLinkSuccess('Github'))
      .catch((error) => handleErrors(toast, error));

  const onUnlinkGithub = () =>
    auth.currentUser
      .unlink('github.com')
      .then(() => onUnlinkSuccess('Github'))
      .catch((error) => handleErrors(toast, error));

  // TODO: Patrick, we need to make sure this actually deletes all the data associated with the user
  const onDeleteAccount = () =>
    auth.currentUser
      .delete()
      .then(onDeleteSuccess)
      .catch((error) => handleErrors(toast, error));

  const schema = yup.object().shape({
    email: validEmail,
  });

  const fields = [{ ...emailField(), label: 'New Email Address' }];

  // @ts-ignore
  const numProviders = user.providerData.length;

  // @ts-ignore
  const hasPasswordAccount = !!user.providerData.filter(
    (p) => p.providerId === 'password'
  ).length;

  // @ts-ignore
  const hasGithubAccount = !!user.providerData.filter(
    (p) => p.providerId === 'github.com'
  ).length;

  return (
    <>
      <Heading as="h4" size="md" mb={4}>
        Manage Linked Accounts
      </Heading>
      <Flex align="center">
        {/* TODO: Icons are kinda ugly like this, do something about it when we import OMUI to the monorepo */}
        <Icon as={FontAwesomeIcon} icon={faEnvelope} size="2x" />
        <Text ml={4} mr={8} fontWeight="bold" color="gray.700">
          Email
        </Text>
        {!hasPasswordAccount && (
          <Link onClick={onAddPassword}>Add a password</Link>
        )}
      </Flex>
      <Flex align="center" mt={4}>
        {/* TODO: Icons are kinda ugly like this, do something about it when we import OMUI to the monorepo */}
        <Icon as={FontAwesomeIcon} icon={faGithub} size="2x" />
        <Text ml={4} mr={8} fontWeight="bold" color="gray.700">
          Github
        </Text>
        {!hasGithubAccount && <Link onClick={onLinkGithub}>Link Account</Link>}
        {hasGithubAccount && numProviders > 1 && (
          <Link onClick={onUnlinkGithub}>Unlink Account</Link>
        )}
      </Flex>
      {hasPasswordAccount && (
        <>
          <Heading as="h4" size="md" mt={8} mb={4}>
            Change Email Address
          </Heading>
          <Form
            {...props}
            onSubmit={onSubmit}
            schema={schema}
            fields={fields}
            submit="Save Changes"
            isBreathable
          />
        </>
      )}
      <Button colorScheme="red" onClick={() => setIsOpen(true)} mt={8}>
        Delete Account
      </Button>
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Account
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure? You can't undo this action afterwards.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={onDeleteAccount} ml={3}>
                Delete Account
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};
