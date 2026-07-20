---
title: "Openstack Neutron 네트워크 구조 한 장 정리"
cat: "Openstack"
tags: [Openstack, Neutron, Network]
summary: >
  ML2 플러그인, OVS 브리지, 네임스페이스가 패킷을 어떻게 흘려보내는지 흐름 중심으로 정리했다.
---

Openstack을 처음 구축할 때 가장 헤매는 부분이 Neutron이다. br-int, br-tun, br-ex 세 개의 브리지와 qrouter/qdhcp 네임스페이스의 역할부터 잡아야 한다.

## 패킷의 여정

VM에서 나온 패킷은 tap 인터페이스를 지나 br-int에서 내부 VLAN 태그를 받고, 외부로 나갈 때 br-tun에서 VXLAN으로 캡슐화된다. devstack 환경에서 각 구간을 직접 캡처해 보면 문서로 읽는 것보다 훨씬 빠르게 이해된다.
