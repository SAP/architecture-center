---
id: id-ra0002-3
slug: /ref-arch/6c73e3575f/3
sidebar_position: 1
sidebar_custom_props:
  category_index: []
title: Load Balancers
description: Load balancers enhance reliability, scalability, and fault tolerance in multi-region SAP BTP setups by distributing traffic intelligently. They ensure optimal performance with real-time failover, health checks, and advanced features, providing seamless operations across diverse geographies.
keywords:
  - sap
  - integration
  - application development
  - ha dr
  - high availability
  - disaster recovery
  - resiliency
  - business continuity
  - failover
sidebar_label: Load Balancers
image: img/logo.svg
tags:
  - aws
  - azure
  - appdev
  - integration
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
  - martinfrick
  - maxstreifeneder
  - kshanth
  - mahesh0431
  - anirban-sap
  - jmsrpp
  - uklasing
  - alperdedeoglu
  - arajsinha
last_update:
  author: arajsinha
  date: 2025-01-31
---

In a multi-region setup for SAP BTP services, load balancers play a crucial role in ensuring the efficient distribution of traffic across multiple regions with the help of health checks automatically or using a manual approach. They help improve the reliability, availability, and fault tolerance of applications by routing incoming requests to the most appropriate resources. Load balancers can automatically detect and redirect traffic from unhealthy instances, reducing downtime and enhancing user experience in an automatic setup. Additionally, they support seamless scaling during traffic surges, enabling a smooth and efficient operation of applications across diverse geographies.

![drawio](drawio/loadbalancer.drawio)


<!-- ![Load Balancers](images/loadbalancer.svg?raw=true) -->

## Types of Load Balancers used for Multi-Region Architectures

### DNS-Based Load Balancers

DNS-based load balancers function at the DNS level, directing user traffic to different regions by resolving DNS queries based on predefined policies such as geographic proximity, latency, or other performance metrics. When a user makes a request, the DNS-based load balancer evaluates the request against its configured rules and responds with the IP address of the most appropriate server or region.

One of the key characteristics of DNS-based load balancers is their reliance on DNS caching. DNS records have a Time-To-Live (TTL) value, which dictates how long the record is cached by DNS resolvers and clients. While this caching mechanism helps reduce the load on DNS servers and speeds up subsequent requests, it can also introduce delays in traffic redirection and slow failover times. If a server or region becomes unhealthy, the DNS-based load balancer will update its records, but the changes will only take effect once the cached records expire based on their TTL.

Despite these limitations, DNS-based load balancers offer significant benefits for geographic distribution and stability. They leverage a globally distributed network of DNS servers to ensure that user requests are resolved quickly and efficiently, regardless of the user's location. This global distribution helps in balancing the load across multiple regions and provides a level of fault tolerance.

However, due to the inherent delay caused by DNS caching, DNS-based load balancers are not suitable for real-time traffic management. They are best used in scenarios where the traffic patterns are relatively stable, and the primary goal is to distribute traffic based on geographic or performance-based policies rather than immediate server health.

### Key Points:

- **Operation Level**: DNS-based load balancers operate at the DNS level.
- **Routing Mechanism**: They resolve DNS queries based on geographic proximity, latency, or other performance rules.
- **DNS Caching**: They rely on DNS caching, which can delay traffic redirection and slow failover.
- **TTL Dependency**: Routing decisions depend on the TTL of DNS records.
- **Global Distribution**: They leverage globally distributed DNS servers for geographic distribution and stability.
- **Use Case**: Suitable for scenarios with stable traffic patterns and non-real-time traffic management needs.

#### Resources

- [Azure Traffic Manager](https://learn.microsoft.com/en-us/azure/traffic-manager/traffic-manager-overview)
- [Amazon Route 53](https://aws.amazon.com/route53/)
- [Google Cloud Load Balancing](https://cloud.google.com/load-balancing)



### Global Load Balancers

### Global Load Balancers

Global load balancers function at the network or application layer, providing real-time traffic management across multiple regions. They dynamically route traffic based on various metrics such as server health, current load, and latency, ensuring optimal performance and availability. Unlike DNS-based load balancers, global load balancers do not rely on DNS caching, allowing for immediate failover and precise traffic distribution.

Global load balancers continuously monitor the health of servers and services in different regions. They use health checks to detect any failures or performance issues and can instantly redirect traffic to healthy instances. This real-time monitoring and routing capability ensures that user requests are always directed to the best available resource, minimizing downtime and enhancing the user experience.

These load balancers also support advanced traffic management features such as SSL termination, content-based routing, and session persistence. SSL termination offloads the SSL decryption process from the backend servers, improving their performance. Content-based routing allows the load balancer to make routing decisions based on the content of the request, such as URL paths or HTTP headers. Session persistence ensures that a user's session is consistently routed to the same backend server, which is crucial for applications that require stateful interactions.

However, the effectiveness of global load balancers depends on proper configuration and maintenance. Misconfigurations or lack of regular updates can lead to failures, impacting the stability and performance of critical applications. Therefore, it is essential to follow best practices for configuration, regularly update the load balancer software, and continuously monitor its performance.

### Key Points:

- **Operation Level**: Operate at the network or application layer.
- **Routing Mechanism**: Dynamic routing based on server health, load, and latency.
- **Real-Time Management**: Immediate failover and precise traffic distribution without relying on DNS caching.
- **Health Monitoring**: Continuous health checks to detect failures and performance issues.
- **Advanced Features**: Support for SSL termination, content-based routing, and session persistence.
- **Configuration Importance**: Requires proper configuration and maintenance to ensure effectiveness.

#### Resources

- [Azure Front Door](https://learn.microsoft.com/en-us/azure/frontdoor/front-door-overview)
- [AWS Global Accelerator](https://aws.amazon.com/global-accelerator/)
- [Google Cloud Load Balancing](https://cloud.google.com/load-balancing)

## Using DNS Load Balancer with SAP BTP in a Multi-Region Context

In an SAP BTP multi-region architecture, integrating a DNS-based load balancer allows you to configure a single custom domain (e.g., `app.company.com`) that intelligently routes traffic to underlying SAP BTP URLs from different subaccounts (e.g., `xyz.subaccount1.btp.sap.com` and `xyz.subaccount2.btp.sap.com`). The DNS load balancer performs health checks on the SAP BTP services and dynamically updates DNS records to route traffic to the healthy and available regional endpoint, ensuring high availability and disaster recovery (DR). If one subaccount becomes unreachable, the load balancer automatically redirects traffic to the other subaccount without disrupting the user experience.

This setup can be configured to automatically route traffic to the healthy region based on health checks or manually update the primary location. Additionally, the SAP Custom Domain service must be configured in the SAP BTP subaccounts.

### Role of SAP Custom Domain service

The SAP Custom Domain Service allows organizations to map their own custom domain names to SAP BTP services or applications URLs. This service is crucial in a multi-region setup for providing a consistent, secure, and reliable user experience.

#### Basic Workflow

- Set up a custom domain (e.g., `app.company.com`) through the SAP Custom Domain Service.
- Map the custom domain to specific SAP BTP service or application URLs in both the subaccounts.
- DNS-based load balancers will update the custom domain DNS record with the healthy SAP BTP subaccount service/application URL.

#### Resources

- [SAP Custom Domain service - SAP Help documentation](https://help.sap.com/docs/custom-domain/custom-domain-manager/what-is-custom-domain)
- [SAP Custom Domain service configuration - Azure Traffic Manager for Multi-region architecture](https://github.com/SAP-samples/btp-services-intelligent-routing/tree/ci_azure/03-MapCustomDomainRoutes)
- [SAP Custom Domain service configuration - AWS Route 53 for Multi-region architecture](https://github.com/SAP-samples/btp-services-intelligent-routing/tree/launchpad_aws/04-Map%20Custom%20Domain%20Routes)
