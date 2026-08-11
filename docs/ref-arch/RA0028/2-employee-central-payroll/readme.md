---
id: dfae42-temp
slug: /ref-arch/dfae42-temp
sidebar_position: 2
title: SAP SuccessFactors Employee Central Payroll
description: Overview of the main integrations between SAP SuccessFactors Employee Central and SAP SuccessFactors Employee Central Payroll
keywords:
  - ref-arch
  - successfactors
  - hcm
  - human capital management
  - HR
  - employee experience
  - employee central
sidebar_label: SAP SuccessFactors Employee Central Payroll
image: img/logo.svg
tags:
  - ref-arch
  - community-contrib
  - successfactors
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - arjenvanhooydonk
discussion: 
last_update:
  author: arjenvanhooydonk
  date: 2026-08-10
---

:::note External Contribution

**This content is brought to you by [Pentos](https://www.pentos.com), an SAP partner.**

:::

SAP SuccessFactors Employee Central Payroll is SAP's cloud-based payroll processing solution that integrates seamlessly with Employee Central to automate and manage end-to-end payroll operations across multiple countries and regions. It leverages the centralized employee master data from Employee Central to calculate wages, salaries, deductions, taxes, and benefits while ensuring compliance with local labor laws and tax regulations in each jurisdiction. Employee Central Payroll supports complex payroll scenarios including multi-country payroll, variable compensation, stock plans, and garnishments, with real-time data synchronization between HR and payroll functions to minimize errors and improve accuracy. By consolidating payroll processing into a single cloud platform integrated with the broader SuccessFactors ecosystem, it enables organizations to reduce operational costs, accelerate payroll cycles, ensure regulatory compliance, and provide employees with self-service access to payroll information through Employee Central's user interface.

## Payroll Data Point-to-Point Integration

Employee Central (EC) and Employee Central Payroll (ECP) are tightly integrated within the SAP SuccessFactors ecosystem, with EC serving as the authoritative master data source for all employee information and ECP consuming that data to execute payroll processing. The data integration between these two systems enables real-time or near-real-time synchronization of critical employee attributes—such as employment status, compensation structures, bank account details, tax information, and deductions—ensuring that payroll calculations are always based on the most current and accurate HR data. This seamless point-to-point integration eliminates manual data transfers, reduces errors, and streamlines the payroll cycle by automatically propagating employee changes from EC (such as salary adjustments, position changes, or new hires) directly into ECP for processing. Through this integrated approach, organizations achieve a unified view of compensation across HR and payroll functions, improve operational efficiency, maintain data consistency, and ensure compliance with local tax and regulatory requirements across multiple jurisdictions. Depending on which data is in use, country specific mappings and custom development there is some variation possible; but in principle this is the mapping from Employee Central into the Employee Central Payroll Infotypes.

![drawio](drawio/successFactors-to-ecp-point-to-point-payroll-data-replication.drawio)

## Time Data Point-to-Point Integration

The integration of time data between Employee Central (EC) and Employee Central Payroll (ECP) is critical for accurate and timely payroll processing, enabling employee work hours, attendance records, and time-off data to flow seamlessly from EC into ECP for wage and salary calculations. Time data captured in Employee Central—including regular hours worked, overtime, absences, leave taken, and shift patterns—is synchronized with Employee Central Payroll to ensure that payroll calculations reflect the actual time worked and applicable deductions or premiums. This real-time or batch data synchronization eliminates manual timesheet entry into payroll systems, reduces calculation errors, and accelerates the payroll cycle by automating the connection between HR time tracking and compensation processing. By maintaining a unified time data flow from EC to ECP, organizations ensure consistency between HR records and payroll outputs, support compliance with labor regulations regarding working hours and compensation, and enable employees to see accurate pay calculations based on their recorded time and attendance. There are multiple versions of the integration based on the exact scenario; but in principle this is the mapping from Employee Central Time data into the Employee Central Payroll Infotypes.

![drawio](drawio/successFactors-to-ecp-point-to-point-time-data-replication.drawio)

## Payment File Integration

SAP SuccessFactors Employee Central Payroll supports multiple ways of positing bank files to banks for the salary payment of employees. Depending on the requirements there are four ways to post the payment files from ECP. Alternatively the bank files can be pushed to the financial system and processed from there.

![drawio](drawio/ecp-payment-file-integration-options.drawio)

1. Standard direct posting: use when there are no specific approval flows required for posting the bank file and only a single bank is used to pay out the salaries
2. Posting via Multi-Bank Connectivity (MBC): use when there are no specific approval flows required for posting the bank file and salaries are paid from multiple banks
3. Posting via Bank Communication Management (BCM) through Multi-Bank Connectivity (MBC): use when approval flows are required for posting the bank file and salaries are paid from multiple banks
4. Posting via Bank Communication Management (BCM): use when approval flows are required for posting the bank file and only a single bank is used to pay out the salaries

Multi-Bank Connectivity (MBC) requires additional SAP licenses to use.
Bank Communication Management (BCM) typically runs in the SAP S4/HANA Finance system, activation in ECP requires SAP approval.

## Resources

- [Setting Up the Point-to-Point Integration | SAP Help Portal](https://help.sap.com/docs/successfactors-employee-central-payroll/implementing-employee-central-payroll-based-on-sap-human-capital-management-for-sap-s4hana/setting-up-point-to-point-integration?locale=en-US&version=LATEST)
- [Implementing Point-to-Point Time Data Replication | SAP Help Portal](https://help.sap.com/docs/successfactors-employee-central-payroll/implementing-point-to-point-time-data-replication/implementing-point-to-point-time-data-replication?locale=en-US&version=LATEST)
- [Configurations for SAP Multi-Bank Connectivity | SAP Help Portal](https://help.sap.com/docs/SAP_MULTI_BANK_CONNECTIVITY/a0fb81f60461411ba33bc586aecd3039/67ef776bc02744e08044e4d9f30b0a4c.html?locale=en-US&version=LATEST)
- [Bank Communication Management | SAP Help Portal](https://help.sap.com/docs/SAP_ERP/3eb91abaa20c4dc696ab706d9d50cb74/3f7ad0531d8b4208e10000000a174cb4.html?locale=en-US&version=LATEST)
