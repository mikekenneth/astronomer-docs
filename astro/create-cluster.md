---
sidebar_label: 'Create a cluster'
title: "Create a new cluster on Astro"
id: create-cluster
description: Create a new Astro cluster for your Organization.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

The Astro install typically starts with 1 Cluster per Organization. Depending on your use case, however, your team can choose to configure multiple Astro Clusters. This could enable a few benefits, including:

- clusters in different regions
- Different clusters for development and production environments

Within a single Workspace, you can host Deployments across multiple clusters. For example, you might have a production Deployment running in a production cluster and a development Deployment running in a development cluster. Both of those Deployments can be in the same Workspace.

This guide provides instructions for provisioning additional clusters within your Astro Organization.

## Prerequisites

To create an Astro cluster, you need to have:

- An activated data plane.
- Permissions to configure IAM in the dedicated account for Astro on your cloud.

<Tabs
    defaultValue="aws"
    groupId= "prerequisites"
    values={[
        {label: 'AWS', value: 'aws'},
        {label: 'Azure', value: 'azure'},
        {label: 'GCP', value: 'gcp'},
    ]}>
<TabItem value="aws">

#### Step 1: Submit a request to Astronomer support

To create a new Astro cluster on AWS for your Organization, submit a [support request](astro-support.md). In your support request, provide the following information for every new cluster that you want to provision:

- Your AWS Account ID.
- Your preferred Astro cluster name.
- The AWS region that you want to host your cluster in.
- Your preferred node instance type.
- Your preferred max node count.
- Your preferred VPC CIDR.

If you don't specify configuration preferences, Astronomer support creates a cluster with a VPC CIDR of 172.20.0.0/19,`m5.xlarge` nodes, and a maximum node count of 20 in `us-east-1`. For information about supported regions, configurations, and defaults, see [Resources required for Astro on AWS](resource-reference-aws.md).

#### Additional setup for AWS regions that are disabled by default

Some AWS regions that Astronomer supports are [disabled by default on AWS](https://docs.aws.amazon.com/general/latest/gr/rande-manage.html#rande-manage-enable). These regions are:

- `af-south-1` - Africa (Cape Town)
- `ap-east-1` - Asia Pacific (Hong Kong)
- `me-south-1` - Middle East (Bahrain)

To create a cluster in one of these regions, complete the following additional setup in your AWS account:

1. In the AWS IAM console, update the `astronomer-remote-management` trust relationship to include permissions for enabling and disabling your desired region as described in the [AWS documentation](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_examples_aws-enable-disable-regions.html):

    ```YAML
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Principal": {
            "AWS": "arn:aws:iam::406882777402:root"
          },
          "Action": "sts:AssumeRole",
          "Condition": {
            "StringEquals": {
              "sts:ExternalId": "<External-ID>"
            }
          }
        }
        {
            "Sid": "EnableDisableRegion",
            "Effect": "Allow",
            "Action": [
                "account:EnableRegion",
                "account:DisableRegion"
            ],
            "Resource": "*",
            "Condition": {
                "StringEquals": {"account:TargetRegion": "<your-aws-region>"}
            }
        },
        {
            "Sid": "ViewConsole",
            "Effect": "Allow",
            "Action": [
                "aws-portal:ViewAccount",
                "account:ListRegions"
            ],
            "Resource": "*"
        }
      ]
    }
    ```

2. In the AWS Management Console, enable the desired region as described in [AWS documentation](https://docs.aws.amazon.com/general/latest/gr/rande-manage.html#rande-manage-enable).
3. Upgrade your [global endpoint session token](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_enable-regions.html#sts-regions-manage-tokens) to version 2, which is valid in all AWS regions, by running the following command via the [AWS CLI](https://aws.amazon.com/cli/):

    ```sh
    aws iam set-security-token-service-preferences --global-endpoint-token-version v2Token
    ```

#### Step 2: Confirm with Astronomer support

Astronomer support sends you a notification when your cluster is created. After your cluster is created, you can create a new Deployment in the cluster and start deploying pipelines. See [Create a Deployment](create-deployment.md).

</TabItem>

<TabItem value="azure">

#### Step 1: Submit a request to Astronomer support

To create a new Astro cluster on Azure for your Organization, submit a [support request](astro-support.md). In your support request, provide the following information for every new cluster that you want to provision:

- Your preferred Astro cluster name.
- The Azure region that you want to host your cluster in.
- Your preferred node instance type.
- Your preferred maximum node count.

If you don't specify configuration preferences, Astronomer support creates a cluster with `Standard_D4d_v5 nodes`, one Postgres Flexible Server instance (`D4ds_v4`), and a maximum node count of 20 in `CentralUS`. If you're using Virtual Private Cloud (VPC) peering, a CIDR block (RFC 1918 IP Space) with the default CIDR range `172.20.0.0/19` is implemented.

For information on all supported regions and configurations, see [Resources required for Astro on Azure](resource-reference-azure.md).  

#### Step 2: Confirm with Astronomer support

Astronomer support sends you a notification when your cluster is created. After your cluster is created, you can create a new Deployment in the cluster and start deploying pipelines. See [Create a Deployment](create-deployment.md).

</TabItem>

<TabItem value="gcp">

#### Step 1: Submit a request to Astronomer support

To create a new Astro cluster on GCP for your Organization, submit a [support request](astro-support.md). In your support request, provide the following information for every new cluster that you want to provision:

- Your preferred Astro cluster name.
- The GCP region that you want to host your cluster in.
- Your preferred node instance type.
- Your preferred CloudSQL instance type.
- Your preferred maximum node count.
- Your preferred VPC CIDR.

If you don't specify configuration preferences, Astronomer support creates a cluster with a VPC CIDR of 172.20.0.0/19, `e2-medium-4 nodes`, one Medium General Purpose CloudSQL instance (4vCPU, 16GB), and a maximum node count of 20 in `us-central1`.  For information on all supported regions and configurations, see [Resources required for Astro on GCP](resource-reference-gcp.md).  

#### Step 2: Confirm with Astronomer support

Astronomer support sends you a notification when your cluster is created. After your cluster is created, you can create a new Deployment in the cluster and start deploying pipelines. See [Create a Deployment](create-deployment.md).

</TabItem>
</Tabs>
