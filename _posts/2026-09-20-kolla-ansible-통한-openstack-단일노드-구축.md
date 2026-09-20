---
title: Kolla-ansible 통한 Openstack 단일노드 구축
date: 2026-06-20 14:11:00 +09:00
categories:
  - Cloud
  - Openstack
tags:
  - Openstack
  - kolla-ansible
  - 단일 노드
  - Cloud
  - Docker
  - VMware
pin: false
description: 본 실습과정은 VMware에서 진행합니다.
---

````plain
# 단일노드 Kolla 구축


1. https://docs.openstack.org/kolla-ansible/latest/user/quickstart.html?utm_source=chatgpt.com
2. https://github.com/openstack/kolla-ansible?utm_source=chatgpt.com


## 구축이전 학습자료들


<aside>


1. Ansible 이해
⇒ https://cwpack0730.tistory.com/6
    
    ⇒https://docs.openstack.org/kolla-ansible/latest/index.html
    
    ⇒ https://tech.osci.kr/kolla-ansible/
    
2. Docker 이해
⇒ https://docs.docker.com/
</aside>


---


## 호스트 시스템 요구 사항


<aside>


지원 운영 체제


- CentOS 스트림 10
- 데비안 트릭시(13)
- 록키 리눅스 10
- 우분투 노블(24.04)
</aside>


---


## 실습 VMware 설정 내용


<aside>


- 2개의 네트워크 인터페이스 (NIC)
- 8GB 메인 메모리
- 6 CPU core 할당
→ Virtualize Intel VT-x/EPT or AMD-V/RVI 설정 완료  해야함.
- 100GB 디스크 공간
</aside>


---


—> 본 실습은 VMware로 진행됨을 알아주세요.


—> SSH 못하는 사람 없을거라 믿습니다. ssh 못하면 복붙 안됨&&&&&&


<aside>


# Kolla-Ansible 기반 단일 노드 실습


## 1. Kolla 배포 명령 실행 준비 과정


### 이 단계에서 완료되는 것


1. Ubuntu 기본 패키지 업데이트
2. NIC 역할 분리 및 설정
3. Python 가상환경 생성
4. Kolla-Ansible 설치
5. `/etc/kolla` 설정 파일 준비
6. Ansible 의존성 설치
7. KVM 사용 가능 여부 확인
8. OpenStack 내부 비밀번호 생성
9. `globals.yml` 작성
10. `bootstrap-servers` 및 `prechecks` 통과


---


## 1-1. root 권한 진입 및 패키지 업데이트


```bash
#root권한 진입
sudo su


#home dic 경로 이동
cd ~


#패키지 업데이트 및 업그레이드
apt update | apt upgrade -y
apt install net-tools
```


---


## 1-2. NIC 설정


이번 실습에서는 NIC를 다음과 같이 사용한다.


```bash
#인터페이스는 다 다름 ex) eno2, enp0s3 etc...  이번 실습에서는 ens33, ens37로 진행


ens33 
→ OpenStack 관리망
→ SSH, Horizon, API, VIP용
→ IP 있음


ens37 
→ Neutron external interface 외부망
→ br-ex에 연결되는 외부망 포트
→ IP 없어야 함
```


Netplan 설정 파일 수정:


```bash
vi /etc/netplan/50-cloud-init.yaml
```


예시 설정:


```yaml
#입력 -> i


network:
  version: 2
  ethernets:
    ens33:
      addresses:
        - 10.0.0.11/24     #고정 ip
      nameservers:
        addresses:
          - 8.8.8.8
      routes:
        - to: default
          via: 10.0.0.2


    ens37:
      dhcp4: false     #dhcp ipv4부분
      dhcp6: false     #dhcp ipv6부분
      optional: true
      
#환경 돌아오기 -> esc
#저장 및 나가기 -> :wq
```


적용:


```bash
netplan apply
```


확인:


```bash
ip -br a
```


정상 기준:


```bash
ens33      UP     10.0.0.11/24       #뒤에 IPv6는 무시
ens37      UP                        #뒤에 IPv6는 무시
```


---


## 1-3. 기본 패키지 설치


```bash
apt install -y git python3-dev libffi-dev gcc libssl-dev libdbus-glib-1-dev python3-venv
```


---


## 1-4. Python 가상환경 생성


```bash
python3 -m venv ~/kolla-venv
source ~/kolla-venv/bin/activate
```


pip 업데이트:


```bash
pip install -U pip
```


Docker Python SDK 설치:


```bash
pip install docker
```


dbus 관련 의존성 설치:


```bash
apt install -y libdbus-1-dev libglib2.0-dev pkg-config build-essential
pip install dbus-python
```


---


## 1-5. Kolla-Ansible 설치


OpenStack 공식 Quick Start 방식에 맞춰 Kolla-Ansible을 설치한다.


```bash
pip install git+https://opendev.org/openstack/kolla-ansible@master
```


버전 확인:


```bash
kolla-ansible --version   #오류 없이 버전 뜨면 성공
```


---


## 1-6. `/etc/kolla` 설정 파일 준비


```bash
mkdir -p /etc/kolla
chown $USER:$USER /etc/kolla
```


Kolla 예제 설정 파일 복사:


```bash
cp -r ~/kolla-venv/share/kolla-ansible/etc_examples/kolla/* /etc/kolla/
```


All-in-One 인벤토리 파일 복사:


```bash
cp ~/kolla-venv/share/kolla-ansible/ansible/inventory/all-in-one ~/
```


확인:


```bash
ls -al /etc/kolla
ls -al ~/all-in-one
```


`/etc/kolla` 안에는 최소한 다음 파일이 있어야 한다.


```
globals.yml
passwords.yml
```


---


## 1-7. Ansible Galaxy 의존성 설치


```bash
kolla-ansible install-deps
```


---


## 1-8. KVM 가능 여부 확인


```bash
egrep -c '(vmx|svm)' /proc/cpuinfo
ls -l /dev/kvm
```


판단 기준:


```
egrep 결과가 1 이상이고 /dev/kvm 존재
→ KVM 사용 가능
→ nova_compute_virt_type: "kvm"


egrep 결과가 0이거나 /dev/kvm 없음
→ KVM 사용 불가
→ nova_compute_virt_type: "qemu"
```


이번 실습에서는 KVM 사용을 목표로 하므로, VMware 설정에서 다음 항목이 필요하다.


```
Virtualize Intel VT-x/EPT or AMD-V/RVI
→ 체크 필요


Virtualize CPU performance counters
→ 체크 해제 권장
```


Windows에서 Hyper-V, VBS, Memory Integrity가 켜져 있으면 nested virtualization이 막힐 수 있다.


---


## 1-9. 내부 비밀번호 생성


```bash
kolla-genpwd
```


경고 메시지(= WARNING)가 떠도 비밀번호 파일이 생성되면 정상이다.


확인:


```bash
ls -l /etc/kolla/passwords.yml
```


---


## 1-10. `globals.yml` 작성


```bash
vi /etc/kolla/globals.yml
```


파일 아래쪽에 다음 내용을 추가한다.


```yaml
# APS CSPM Lab - Kolla Ansible All-in-One
# vi 환경에서 원하는거 찾을때 다음과 같이 치면 나온다.
# /(찾을 내용)


kolla_base_distro: "ubuntu"


network_interface: "ens33"
neutron_external_interface: "ens37"
kolla_internal_vip_address: "10.0.0.50"


enable_horizon: "yes"
enable_cinder: "no"


nova_compute_virt_type: "kvm"


# 저장 :wq
```


주의사항:


```
globals.yml 안에 --- 구분자가 여러 개 생기면 YAML 오류가 날 수 있음.
기존 예제 파일 구조를 유지한 채, 설정값만 하단에 추가하는 것이 안전하다.
즉, 주석을 지우고 하라는 의미
```


YAML 문법 확인:


```bash
python3 -c 'import yaml; yaml.safe_load(open("/etc/kolla/globals.yml")); print("YAML OK")'


#YAML Ok 라고 뜨면 성공
```


---


## 1-11. Bootstrap 및 Prechecks


Bootstrap


```bash
kolla-ansible bootstrap-servers -i ./all-in-one
```


Prechecks 실행:


```bash
kolla-ansible prechecks -i ./all-in-one --use-test-images
```


`failed=0`이면 정상이다.


---


## 1단계 체크리스트


### 체크리스트


1. `/etc/kolla/passwords.yml` 생성됨
2. `globals.yml`에 `ens33`, `ens37`, VIP 설정 들어감
3. `ens33`에 관리 IP 있음
4. `ens37`에 IPv4 없음
5. `/dev/kvm` 존재함
6. `nova_compute_virt_type: "kvm"` 설정됨
7. `bootstrap-servers` 성공
8. `prechecks` 성공


---


# 2. OpenStack 컴포넌트 Docker 배포 단계


## 2-1. tmux 설치 및 실행


`deploy` 과정은 오래 걸릴 수 있으므로 SSH 끊김 방지를 위해 tmux를 사용한다.


```bash
apt install -y tmux
tmux new -s kolla
```


tmux 안으로 들어간 뒤 가상환경을 다시 활성화한다.


```bash
source ~/kolla-venv/bin/activate
cd ~
```


---


## 2-2. OpenStack 배포


```bash
kolla-ansible deploy -i ./all-in-one
```


주의사항:


```
prechecks에서는 --use-test-images 옵션을 사용했지만,
deploy 명령에는 --use-test-images를 붙이지 않음.
```


정상 완료 기준:


```
failed=0
```


배포 시간은 환경에 따라 10~50분 정도 걸릴 수 있다.


---


## 2-3. Docker 컨테이너 확인


```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
```


정상적으로 다음과 같은 컨테이너들이 실행되어야 한다.


```
horizon
heat_engine
heat_api_cfn
heat_api
neutron_metadata_agent
neutron_l3_agent
neutron_dhcp_agent
neutron_openvswitch_agent
neutron_periodic_worker
neutron_rpc_server
neutron_server
nova_compute
nova_libvirt
nova_ssh
nova_novncproxy
nova_conductor
nova_metadata
nova_api
nova_scheduler
openvswitch_vswitchd
openvswitch_db
placement_api
glance_api
keystone
keystone_fernet
keystone_ssh
rabbitmq
memcached
mariadb
keepalived
proxysql
haproxy
fluentd
cron
kolla_toolbox
```


대부분 `healthy` 상태이면 정상이다.


---


## 2-4. tmux 나가기


tmux 세션에서 빠져나오기:


```
Ctrl + B
D
```


만약 다시 들어가고 싶다면:


```bash
tmux attach -t kolla
```


---


## 2-5. post-deploy 실행


```bash
source ~/kolla-venv/bin/activate
cd ~


kolla-ansible post-deploy -i ./all-in-one
```


생성 파일 확인:


```bash
ls -l /etc/kolla/clouds.yaml
ls -l /etc/kolla/admin-openrc.sh
```


---


## 2-6. OpenStack CLI 설치


```bash
pip install python-openstackclient -c https://releases.openstack.org/constraints/upper/master
```


---


## 2-7. OpenStack CLI 인증 테스트


방법 1: clouds.yaml 사용


```bash
export OS_CLIENT_CONFIG_FILE=/etc/kolla/clouds.yaml
openstack --os-cloud kolla-admin service list
```


방법 2: admin-openrc 사용     #이게 더 편함


```bash
source /etc/kolla/admin-openrc.sh
openstack service list
```


환경변수 확인:


```bash
echo $OS_AUTH_URL
echo $OS_USERNAME
echo $OS_PROJECT_NAME
```


---


## 2-8. OpenStack 기본 상태 점검


```bash
openstack endpoint list
openstack hypervisor list
openstack network agent list
openstack compute service list
openstack image list
openstack network list
openstack security group list
```


정상 기준:


```
Keystone, Nova, Neutron, Glance, Placement 서비스가 보임


Hypervisor State가 up


Nova compute service가 enabled/up


Neutron agent가 Alive :-) / UP


기본 security group이 보임
```


---


## 2-9. Horizon 접속


브라우저에서 접속:


```
http://10.0.0.50
```


또는 다음 주소로 직접 접근:


```
http://10.0.0.50/auth/login/
```


admin 비밀번호 확인:


```bash
grep OS_PASSWORD /etc/kolla/admin-openrc.sh   #pw 얻으면 어느 파일에 저장
```


로그인 정보:


```
Domain: Default
User: admin
Password: OS_PASSWORD 값
```


`curl -I http://10.0.0.50` 결과가 `302 Found`이면 Horizon은 정상 응답 중이다.


---


## 2단계 체크리스트


### 체크리스트


1. VMware 단일 노드 Ubuntu VM 구성 완료
2. Kolla-Ansible 설치 완료
3. KVM 활성화 확인
4. `bootstrap-servers` 성공
5. `prechecks` 성공
6. `deploy` 성공
7. Docker 컨테이너 정상 실행
8. `post-deploy` 성공
9. OpenStack CLI 인증 성공
10. service / endpoint 조회 성공
11. Horizon 접속 성공


---


# 3. OpenStack 리소스 생성 준비


### 생성할 리소스


1. CirrOS 이미지
2. Flavor
3. Private Self-Service Network
4. Public External Network
5. Router
6. Security Group
7. Keypair
8. CirrOS 테스트 인스턴스
9. Floating IP
10. CSPM 테스트용 위험 설정


---


## 3-1. venv 및 admin-openrc 실행


```bash
source ~/kolla-venv/bin/activate
source /etc/kolla/admin-openrc.sh
```


OpenStack CLI 확인:


```bash
openstack service list
```


---


## 3-2. CirrOS 이미지 등록


```bash
cd /tmp


wget -O cirros-0.6.3-x86_64-disk.img \
https://download.cirros-cloud.net/0.6.3/cirros-0.6.3-x86_64-disk.img
```


주의사항:


```
wget 명령어에서 \ 뒤에 공백을 넣으면 안 된다.
줄바꿈을 쓰지 않을 경우 한 줄로 작성해도 됨.
```


위에 실패 했다면 한 줄 버전 사용:


```bash
wget -O /tmp/cirros-0.6.3-x86_64-disk.img https://download.cirros-cloud.net/0.6.3/cirros-0.6.3-x86_64-disk.img
```


OpenStack Glance에 이미지 등록:


```bash
openstack image create "cirros-0.6.3" \
  --file /tmp/cirros-0.6.3-x86_64-disk.img \
  --disk-format qcow2 \
  --container-format bare \
  --public
```


이미지 확인:


```bash
openstack image list
```


정상 기준:


```
cirros-0.6.3 이미지가 보이고 status가 active
```


상세 확인:


```bash
openstack image show cirros-0.6.3 \
  -c id \
  -c name \
  -c status \
  -c visibility \
  -c protected \
  -c disk_format \
  -c container_format \
  -c size
```


예상 결과:


```
container_format: bare
disk_format: qcow2
id: ~~~~~
name: cirros-x.x.x
protected: False
size: ~~~~
status: active
visibility: public
```


---


## 3단계 현재 상태


여기까지 완료되면 OpenStack 위에 테스트 인스턴스를 만들기 위한 이미지 준비가 끝난 것이다.


다음 단계에서는 다음 리소스들을 생성한다.


```
private network
public network
router
security group
keypair
cirros-test instance
floating ip
```


이후 CSPM에서는 이 리소스들을 수집하고 보안 점검 룰을 적용한다.


# OpenStack 네트워크 구성 및 CirrOS 인스턴스 생성


## 1. Horizon 접속 확인


OpenStack 배포 후 Horizon 접속은 아래 주소로 확인한다.


```
http://10.0.0.50
```


접속이 안 되는 경우 Ubuntu VM 내부에서 VIP와 Horizon 상태를 확인한다.


```bash
ip -br a | egrep 'ens33|ens37'
ping -c 3 10.0.0.50
curl -I http://10.0.0.50
```


`curl -I http://10.0.0.50` 결과가 `302 Found` 또는 로그인 페이지로 리다이렉트되면 Horizon은 정상적으로 살아 있는 것이다.


admin pw확인은 다음과 같다.


```bash
grep OS_PASSWORD /etc/kolla/admin-openrc.sh


#ex) 4LYabl7jTfGQtBFm8NbqNbXDlwkRxMlwf1EDLQMe 이런느낌
```


로그인 정보는 다음과 같다.


```
Domain: Default
User: admin
Password: OS_PASSWORD 값
```


---


## 2. 현재 네트워크 전제


이번 구성은 다음 네트워크 구조를 기준으로 한다.


```
관리망 / Management Network
- Interface: ens33
- Controller IP: 10.0.0.11/24
- Gateway: 10.0.0.2
- Kolla Internal VIP: 10.0.0.50


Provider / External Network
- Interface: ens37
- Host IP: 없음
- OpenStack Provider Network 대역: 192.168.2.0/24
- Provider Gateway: 192.168.2.2
- Floating IP Pool: 192.168.2.200 ~ 192.168.2.250


Self-Service Network
- OpenStack 내부 VM 네트워크
- CIDR: 172.16.1.0/24
- Gateway: 172.16.1.1
```


---


## 3. Kolla-Ansible 네트워크 설정 기준


`/etc/kolla/globals.yml`의 핵심 네트워크 설정은 다음과 같이 맞춘다.


```yaml
network_interface: "ens33"
neutron_external_interface: "ens37"
kolla_internal_vip_address: "10.0.0.50"
```


역할은 다음과 같다.


```
network_interface
→ 관리망 인터페이스
→ OpenStack API, Horizon, SSH, 내부 서비스 통신에 사용


neutron_external_interface
→ Provider / External Network 인터페이스
→ OpenStack Floating IP와 External Network에 사용
→ IP를 직접 주지 않음


kolla_internal_vip_address
→ OpenStack 내부 VIP
→ Controller IP와 다른 비어 있는 IP 사용
```


설정 확인은 다음 명령어로 한다.


```bash
grep -E 'network_interface|neutron_external_interface|kolla_internal_vip_address' /etc/kolla/globals.yml
```


---


## 4. OpenStack 인증 로드


OpenStack CLI를 사용하기 전에 가상환경과 admin 인증 정보를 로드한다.


```bash
source ~/kolla-venv/bin/activate
source /etc/kolla/admin-openrc.sh
```


정상 확인:


```bash
openstack token issue
```


`OS_AUTH_URL`도 확인한다.


```bash
echo $OS_AUTH_URL
```


정상 예시는 다음과 같다.


```
http://10.0.0.50:5000
```


---


## 5. ML2 Provider Physical Network 확인


Provider Network를 만들기 전에 Neutron ML2 설정에서 flat network 이름을 확인한다.


```bash
docker exec -it neutron_server cat /etc/neutron/plugins/ml2/ml2_conf.ini
```


또는 필요한 부분만 확인한다.


```bash
docker exec -it neutron_server cat /etc/neutron/plugins/ml2/ml2_conf.ini | grep -A5 '\[ml2_type_flat\]'
```


정상 예시는 다음과 같다.


```
[ml2_type_flat]
flat_networks = physnet1
```


여기에서 확인한 `physnet1` 값을 Provider Network 생성 시 사용한다.


```bash
--provider-physical-network physnet1
```


즉, `ml2_conf.ini`에 `flat_networks = physnet1`로 되어 있으면 OpenStack Provider Network 생성 명령에서도 반드시 `physnet1`을 사용해야 한다.


---


## 6. OVS br-ex 확인


OpenStack External Network가 실제로 `ens37`과 연결되는지 확인한다.


```bash
docker exec -it openvswitch_vswitchd ovs-vsctl show
```


확인할 것:


```
br-ex 존재 여부
br-ex에 ens37 또는 관련 포트가 연결되어 있는지
```


정상 예시는 다음과 비슷하다.


```
Bridge br-ex
    Port ens37
        Interface ens37
```


만약 `br-ex`에 `ens37`이 없다면 Provider Network와 Floating IP 통신이 정상적으로 되지 않을 수 있다.


---


## 7. 기존 실습 리소스 정리(만약 초기이면 8번으로 바로 가기)


네트워크를 다시 구성하기 전에 기존에 만든 인스턴스, Floating IP, Router, Network, Subnet, Security Group 등을 정리한다.


```bash
source ~/kolla-venv/bin/activate
source /etc/kolla/admin-openrc.sh
```


인스턴스 삭제:


```bash
for SERVER_ID in $(openstack server list -f value -c ID); do
  openstack server delete $SERVER_ID || true
done


sleep 15
```


Floating IP 삭제:


```bash
for FIP_ID in $(openstack floating ip list -f value -c ID); do
  openstack floating ip delete $FIP_ID || true
done
```


Router 삭제:


```bash
for ROUTER in $(openstack router list -f value -c Name); do
  for SUBNET in $(openstack subnet list -f value -c Name); do
    openstack router remove subnet $ROUTER $SUBNET || true
  done


  openstack router unset $ROUTER --external-gateway || true
  openstack router delete $ROUTER || true
done
```


Subnet / Network 삭제:


```bash
for SUBNET_ID in $(openstack subnet list -f value -c ID); do
  openstack subnet delete $SUBNET_ID || true
done


for NET_ID in $(openstack network list -f value -c ID); do
  openstack network delete $NET_ID || true
done
```


실습용 Security Group이 있다면 삭제한다.


```bash
openstack security group delete sg-cirros || true
openstack security group delete sg-danger-test || true
```


Keypair가 있다면 삭제한다.


```bash
openstack keypair delete os-test-key || true
rm -f ~/.ssh/os_test_key ~/.ssh/os_test_key.pub
```


정리 후 상태를 확인한다.


```bash
openstack server list
openstack floating ip list
openstack router list
openstack network list
openstack subnet list
openstack security group list
openstack keypair list
```


정상적으로 정리되었다면 인스턴스, Floating IP, Router, Network, Subnet, Keypair는 비어 있고, Security Group에는 기본 `default`만 남아 있을 수 있다.


---


## 8. Provider External Network 생성


이번 구성에서는 `ens37`이 실제 Provider 외부망 역할을 한다. 따라서 veth-ext, veth-ext-br, 172.16.200.0/24 NAT 우회 방식은 사용하지 않는다.


Provider Network를 생성한다.


```bash
openstack network create \
  --external \
  --share \
  --provider-network-type flat \
  --provider-physical-network physnet1 \
  provider
```


확인한다.


```bash
openstack network list
openstack network show provider
```


정상 확인 포인트:


```
provider:network_type = flat
provider:physical_network = physnet1
router:external = External
shared = True
```


---


## 9. Provider Subnet 생성


Provider Network의 Subnet을 생성한다.


```bash
openstack subnet create --network provider \
  --allocation-pool start=192.168.2.200,end=192.168.2.250 \
  --dns-nameserver 8.8.4.4 \
  --gateway 192.168.2.1 \
  --subnet-range 192.168.2.0/24 \
  provider
```


확인한다.


```bash
openstack subnet show provider
```


정상 확인 포인트:


```
allocation_pools = 192.168.2.200-192.168.2.250
cidr = 192.168.2.0/24
gateway_ip = 192.168.2.1
```


주의할 점:


```
192.168.2.0/24는 ens37이 실제로 연결된 외부망이어야 한다.
192.168.2.1는 실제 외부망 게이트웨이여야 한다.
192.168.2.200~250은 다른 장비와 충돌하지 않는 Floating IP 범위여야 한다.
```


---


## 10. Self-Service Network 생성


인스턴스가 사용할 내부 네트워크를 생성한다.


```bash
openstack network create selfservice
```


Self-Service Subnet을 생성한다.


```bash
openstack subnet create --network selfservice \
  --dns-nameserver 8.8.4.4 \
  --gateway 172.16.1.1 \
  --subnet-range 172.16.1.0/24 \
  selfservice
```


확인한다.


```bash
openstack network list
openstack subnet list
openstack subnet show selfservice
```


정상 확인 포인트:


```
selfservice network 존재
selfservice subnet CIDR = 172.16.1.0/24
gateway_ip = 172.16.1.1
```


---


## 11. Router 생성 및 연결


Self-Service Network와 Provider Network를 연결할 Router를 생성한다.


```bash
openstack router create router
```


Router에 selfservice subnet을 연결한다.


```bash
openstack router add subnet router selfservice
```


Router에 external gateway를 연결한다.


```bash
openstack router set router --external-gateway provider
```


확인한다.


```bash
openstack router list
openstack router show router
openstack port list --router router
```


정상 구조는 다음과 같다.


```
router internal gateway: 172.16.1.1
router external gateway: 192.168.2.x     ex)192.168.2.246
```


---


## 12. qrouter 외부 통신 확인


Router namespace를 확인한다.


```bash
QR=$(ip netns | awk '/qrouter/{print $1; exit}')
echo $QR
```


Router에서 selfservice gateway를 확인한다.


```bash
ip netns exec $QR ip a
ip netns exec $QR ip route
```


Router에서 Provider Gateway로 ping을 보낸다.


```bash
ip netns exec $QR ping -c 3 192.168.2.1
```


외부 인터넷으로 ping을 보낸다.


```bash
ip netns exec $QR ping -c 3 8.8.8.8
```


정상 기준:


```
192.168.2.1 ping 성공
→ Provider Gateway까지 정상


8.8.8.8 ping 성공
→ Router 외부 인터넷 통신 정상
```


만약 여기서 실패하면 Provider Network, br-ex, ens37, VMware 네트워크 연결 상태를 먼저 확인한다.


---


## 13. Security Group Rule 설정


이번 구성에서는 기본 `default` Security Group에 테스트용으로 ICMP와 SSH를 허용한다.


ICMP 허용:


```bash
openstack security group rule create default \
  --ingress \
  --ethertype IPv4 \
  --protocol icmp \
  --remote-ip 0.0.0.0/0
```


SSH 허용:


```bash
openstack security group rule create default \
  --ingress \
  --ethertype IPv4 \
  --protocol tcp \
  --dst-port 22 \
  --remote-ip 0.0.0.0/0
```


확인한다.


```bash
openstack security group rule list default --long
```


이 설정은 이후 CSPM에서 다음과 같은 룰의 테스트 대상이 될 수 있다.


```
SG-001: SSH open to the world
SG-ICMP-001: ICMP open to the world
```


---


## 14. CirrOS 이미지 확인 및 등록


이미 CirrOS 이미지가 등록되어 있는지 확인한다.


```bash
openstack image list
```


이미지가 없다면 다운로드 후 등록한다.


```bash
cd /tmp


wget -O cirros-0.6.3-x86_64-disk.img \
https://download.cirros-cloud.net/0.6.3/cirros-0.6.3-x86_64-disk.img
```


```bash
openstack image create "cirros-0.6.3" \
  --file /tmp/cirros-0.6.3-x86_64-disk.img \
  --disk-format qcow2 \
  --container-format bare \
  --public
```


다시 확인한다.


```bash
openstack image list
```


---


## 15. Flavor 생성


CirrOS 인스턴스가 사용할 작은 flavor를 생성하거나 확인한다.


```bash
openstack flavor show m1.tiny >/dev/null 2>&1 || \
openstack flavor create m1.tiny --ram 512 --disk 1 --vcpus 1
```


확인한다.


```bash
openstack flavor list
```


---


## 16. CirrOS 인스턴스 생성


Self-Service Network에 CirrOS 인스턴스를 생성한다.


```bash
openstack server create cirros-test \
  --image cirros-0.6.3 \
  --flavor m1.tiny \
  --network selfservice \
  --security-group default
```


상태를 확인한다.


```bash
openstack server list
openstack server show cirros-test -c status -c addresses -c fault
```


`ACTIVE`가 될 때까지 확인한다.


```bash
watch -n 2 openstack server list
```


정상 상태는 다음과 같다.


```
status = ACTIVE
addresses = selfservice=172.16.1.x     #ex) 172.16.1.3


#나가기 ctrl + c 2번
```


---


## 17. CirrOS 콘솔 접속 및 내부 통신 확인


콘솔 URL을 확인한다.


```bash
openstack console url show cirros-test
```


또는 Horizon에서 접속한다.


```
Project
→ Compute
→ Instances
→ cirros-test
→ Console
```


CirrOS 로그인 정보는 다음과 같다.


```
ID: cirros
PW: gocubsgo
```


CirrOS 내부에서 네트워크를 확인한다.


```bash
ip a
ip route
```


Ping 테스트를 수행한다.


```bash
ping -c 3 172.16.1.1
ping -c 3 192.168.2.1
ping -c 3 8.8.8.8
ping -c 3 google.com
```


정상 기준은 다음과 같다.


```
172.16.1.1 ping 성공
→ Router 내부 인터페이스까지 정상


192.168.2.1 ping 성공
→ Provider Gateway까지 정상


8.8.8.8 ping 성공
→ 외부 인터넷 정상


google.com ping 성공
→ DNS 정상
```


---


## 18. Floating IP 생성 및 연결


Floating IP를 생성한다.


```bash
openstack floating ip create provider
```


Floating IP 목록을 확인한다.


```bash
openstack floating ip list
```


예를 들어 Floating IP가 `192.168.2.2xx`이라면 인스턴스에 연결한다.


```bash
openstack server add floating ip cirros-test 192.168.2.2xx
```


확인한다.


```bash
openstack floating ip list
openstack server show cirros-test -c addresses
```


정상 예시는 다음과 같다.


```
selfservice=172.16.1.x, 192.168.2.2xx
```


---


## 19. Controller에서 Floating IP 접근 확인


Controller에서 Floating IP로 ping한다.


```bash
ping -c 3 192.168.2.2xx
```


SSH 접속을 확인한다.


```bash
ssh cirros@192.168.2.200
```


CirrOS 비밀번호는 다음과 같다.


```
gocubsgo
```


---


## 20. Windows에서 Floating IP 접근 확인


Windows가 `192.168.2.0/24` Provider Network로 직접 접근 가능한 구조라면 바로 ping과 SSH를 테스트한다.


```bash
ping 192.168.2.2xx
ssh cirros@192.168.2xx
```


만약 Windows에서 `192.168.2.0/24`로 직접 라우팅되지 않는 구조라면 Windows 관리자 CMD에서 라우트를 추가한다.


```bash
route add 192.168.2.0 mask 255.255.255.0 10.0.0.11
```


그 후 다시 테스트한다.


```bash
ping 192.168.2.2xx
ssh cirros@192.168.2.2xx
```


---


## 21. 현재 성공한 구성 요약


최종적으로 성공해야 하는 네트워크 구조는 다음과 같다.


```
관리망
10.0.0.0/24
controller: 10.0.0.11
VIP: 10.0.0.50
gateway: 10.0.0.2


Provider External Network
192.168.2.0/24
provider gateway: 192.168.2.1
Floating IP pool: 192.168.2.200~192.168.2.250
Floating IP 예시: 192.168.2.2xx


Self-Service Network
172.16.1.0/24
router internal gateway: 172.16.1.1
cirros-test fixed IP: 172.16.1.x


Router
router
internal: 172.16.1.1
external: 192.168.2.x
```


현재 성공해야 하는 항목은 다음과 같다.


```
Horizon 접속 성공


OpenStack 서비스 정상


ML2 physnet1 확인 성공


br-ex와 ens37 연결 확인


Provider Network 생성 성공


Self-Service Network 생성 성공


Router 생성 및 연결 성공


qrouter에서 192.168.2.1 ping 성공


qrouter에서 8.8.8.8 ping 성공


CirrOS 이미지 등록 성공


CirrOS 인스턴스 생성 성공


CirrOS 내부에서 외부 ping 성공


Floating IP 생성 및 연결 성공


Controller에서 Floating IP ping/SSH 성공


Windows에서 Floating IP ping/SSH 성공
```


---


## 22. 재부팅 후 확인할 것


이번 구성은 veth-ext 기반 우회 방식이 아니므로 이전처럼 `veth-ext`, `iptables NAT`, `172.16.200.x /32 route`를 매번 복구할 필요는 없다.


다만 재부팅 후에는 아래 항목을 확인한다.


```bash
source ~/kolla-venv/bin/activate
source /etc/kolla/admin-openrc.sh


ip -br a | egrep 'ens33|ens37|br-ex'
ip route


docker exec -it openvswitch_vswitchd ovs-vsctl show


openstack network list
openstack subnet list
openstack router list
openstack server list
openstack floating ip list
```


확인할 것:


```
ens33 = 10.0.0.11/24
ens37 = IP 없음
br-ex 존재
br-ex에 ens37 연결
router 외부 게이트웨이 유지
Floating IP 연결 유지
```


---


</aside>
````
