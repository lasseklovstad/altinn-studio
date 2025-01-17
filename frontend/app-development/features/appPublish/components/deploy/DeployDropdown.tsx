import React, { useState } from 'react';
import classes from './DeployDropdown.module.css';
import type { MouseEvent } from 'react';
import { AltinnIcon, AltinnSpinner } from 'app-shared/components';
import { AltinnPopoverSimple } from 'app-shared/components/molecules/AltinnPopoverSimple';
import { Button, Select } from '@digdir/design-system-react';
import { DeploymentStatus } from '../appDeploymentComponent';
import { formatTimeHHmm } from 'app-shared/pure/date-format';
import { getAzureDevopsBuildResultUrl } from '../../../../utils/urlHelper';
import { getParsedLanguageFromKey } from 'app-shared/utils/language';
import { shouldDisplayDeployStatus } from './utils';

interface Props {
  appDeployedVersion: string;
  envName: string;
  releases?: any[];
  language: any;
  disabled: boolean;
  deployHistoryEntry: any;
  deploymentStatus: DeploymentStatus;
  setSelectedImageTag: (tag) => void;
  selectedImageTag: string;
  startDeploy: any;
}

export const DeployDropdown = ({
  appDeployedVersion,
  releases,
  envName,
  language,
  deploymentStatus,
  deployHistoryEntry,
  selectedImageTag,
  setSelectedImageTag,
  disabled,
  startDeploy,
}: Props) => {
  const t = (key: string, params?: any) => getParsedLanguageFromKey(key, language, params || []);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  return (
    <>
      <div>{t('app_deploy_messages.choose_version')}</div>
      <div className={classes.select} id={`deploy-select-${envName.toLowerCase()}`}>
        {releases.length > 0 && (
          <Select
            options={releases || []}
            onChange={(value: string) => setSelectedImageTag(value)}
          />
        )}
      </div>
      <div className={classes.deployButton}>
        <Button
          disabled={disabled}
          onClick={(e: MouseEvent<HTMLButtonElement>) => setAnchorEl(e.currentTarget)}
          id={`deploy-button-${envName.toLowerCase()}`}
        >
          {t('app_deploy_messages.btn_deploy_new_version')}
        </Button>
        <AltinnPopoverSimple
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          btnCancelText='avbryt'
          btnClick={() => {
            startDeploy();
            setAnchorEl(null);
          }}
          btnConfirmText={'Ja'}
          btnPrimaryId={`deploy-button-${envName.toLowerCase()}-confirm`}
          handleClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          paperProps={{ classes: { root: classes.paperProps } }}
        >
          <>
            {appDeployedVersion
              ? t('app_deploy_messages.deploy_confirmation', [selectedImageTag, appDeployedVersion])
              : t('app_deploy_messages.deploy_confirmation_short', [selectedImageTag])}
          </>
        </AltinnPopoverSimple>
      </div>
      {shouldDisplayDeployStatus(deployHistoryEntry?.created) && (
        <div className={classes.deployStatusGridContainer}>
          <div className={classes.deploySpinnerGridItem}>
            {deploymentStatus === DeploymentStatus.inProgress && <AltinnSpinner />}
            {deploymentStatus === DeploymentStatus.succeeded && (
              <AltinnIcon iconClass='ai ai-check-circle' iconColor='#12AA64' iconSize='3.6rem' />
            )}
            {(deploymentStatus === DeploymentStatus.partiallySucceeded ||
              deploymentStatus === DeploymentStatus.none) && (
              <AltinnIcon iconClass='ai ai-info-circle' iconColor='#008FD6' iconSize='3.6rem' />
            )}
            {(deploymentStatus === DeploymentStatus.canceled ||
              deploymentStatus === DeploymentStatus.failed) && (
              <AltinnIcon
                iconClass='ai ai-circle-exclamation'
                iconColor='#E23B53'
                iconSize='3.6rem'
              />
            )}
          </div>
          <div>
            {deploymentStatus === DeploymentStatus.inProgress &&
              t('app_deploy_messages.deploy_in_progress', [
                deployHistoryEntry?.createdBy,
                deployHistoryEntry?.tagName,
                getAzureDevopsBuildResultUrl(deployHistoryEntry?.build.id),
              ])}
            {deploymentStatus === DeploymentStatus.succeeded &&
              t('app_deploy_messages.success', [
                deployHistoryEntry?.tagName,
                formatTimeHHmm(deployHistoryEntry?.build.finished),
                envName,
                deployHistoryEntry?.createdBy,
                getAzureDevopsBuildResultUrl(deployHistoryEntry?.build.id),
              ])}
            {deploymentStatus === DeploymentStatus.failed &&
              t('app_deploy_messages.failed', [
                deployHistoryEntry?.tagName,
                formatTimeHHmm(deployHistoryEntry?.build.finished),
                envName,
                getAzureDevopsBuildResultUrl(deployHistoryEntry?.build.id),
              ])}
            {deploymentStatus === DeploymentStatus.canceled &&
              t('app_deploy_messages.canceled', [
                deployHistoryEntry?.tagName,
                formatTimeHHmm(deployHistoryEntry?.build.finished),
                envName,
                getAzureDevopsBuildResultUrl(deployHistoryEntry?.build.id),
              ])}
            {deploymentStatus === DeploymentStatus.partiallySucceeded &&
              t('app_deploy_messages.partiallySucceeded', [
                deployHistoryEntry?.tagName,
                envName,
                formatTimeHHmm(deployHistoryEntry?.build.finished),
                getAzureDevopsBuildResultUrl(deployHistoryEntry?.build.id),
              ])}
            {deploymentStatus === DeploymentStatus.none &&
              t('app_deploy_messages.none', [
                deployHistoryEntry?.tagName,
                formatTimeHHmm(deployHistoryEntry?.build.finished),
                envName,
                getAzureDevopsBuildResultUrl(deployHistoryEntry?.build.id),
              ])}
          </div>
        </div>
      )}
    </>
  );
};
