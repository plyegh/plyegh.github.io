---
title: "[ROSMASTER M1] 1탄 - 라즈베리파이5 버전 하드웨어 조립기"
date: 2026-11-11T19:30:00+09:00
tags: [ros2, rosmaster, yahboom, raspberry-pi, mecanum, lidar, hardware]
series: "ROSMASTER M1"
imageWidth: 600
---
![조립을 마친 ROSMASTER M1 (라즈베리파이5 + 2DOF PTZ + T-MINI PLUS)](./a27-complete-kit.jpg)

## 들어가며

Yahboom의 **ROSMASTER M1**은 메카넘 휠 4개를 단 ROS2(Humble) 교육용 로봇이다. 메인 보드는 라즈베리파이5 / RDK X5 / Jetson Nano / Jetson Orin Nano 중에서 고를 수 있는데, 나는 **라즈베리파이5** 버전으로 조립했다.

이 시리즈는 두 편으로 나눠서 쓸 계획이다.

- **1탄 (이 글)**: 부품 구성, 조립, 배선, 첫 전원 투입까지 (하드웨어)
- **2탄**: 라즈베리파이 접속, Docker 안의 ROS2 실행, 센서·모터 코드 작업 (소프트웨어)

공식 조립 영상은 아래에 있다. 다만 내 구성은 영상과 몇 군데가 달라서, 그 차이도 같이 정리했다.

<https://www.youtube.com/watch?v=YzhgxadNNls>

---

## 1. 언박싱과 구성

![언박싱](./a01-unbox.jpg)
_박스를 열면 차체, 라즈베리파이5, 부품 봉지가 폼에 나뉘어 들어 있다_

![구성품](./a03-parts.jpg)
_배터리, 드라이버, Raspberry Pi 5(4GB), Cool Cooler Pi5, 부품 봉지들_

| 구분 | 구성 |
|---|---|
| 차체 | ROSMASTER M1 기본 차체 (Standard) |
| 메인 보드 | Raspberry Pi 5 **4GB** + Cool Cooler Pi5 방열판 + 128GB TF카드 |
| 옵션 | 2DOF PTZ (서보 2개 + USB 카메라), T-MINI PLUS 라이다 |
| 기본 포함 | AI 대형모델 음성 모듈 + 스피커, 무선 게임패드, 12.6V 충전기 |
| 미구매 | Nuwa-HP60C 뎁스 카메라 |

## 2. 부품별 역할

| 부품 | 역할 |
|---|---|
| 기본 차체 | 메탈 섀시, 메카넘 휠 4개, 엔코더 모터 4개. **OLED와 로봇 제어보드가 미리 장착**되어 온다 |
| 로봇 제어보드 (확장보드 V3.0) | STM32 MCU가 모터 구동, 엔코더 읽기, 9축 IMU, PWM 서보, 부저, 전원 분배를 맡는다. 파이와는 Micro USB(CH340)로 통신한다 |
| OLED | CPU·메모리·SD·IP 표시. 파이 GPIO의 I2C 핀에 연결 |
| USB HUB 확장보드 (YB-ERU01) | 파이의 USB 포트를 늘려준다. 라이다·카메라·음성 모듈·제어보드가 여기를 거친다 |
| 배터리 팩 (12V 6000mAh) | 3셀 리튬이온. 완충 시 12.6V, T형 커넥터로 제어보드에 연결 |
| Raspberry Pi 5 | 로봇의 두뇌. ROS2 Humble이 **Docker 안에서** 돌아간다 |
| Cool Cooler Pi5 | 방열판 + 팬. 비전·LLM 작업에는 필수 |
| TF카드 128GB | Yahboom 공장 이미지(OS + Docker + ROS 패키지) |
| 2DOF PTZ | 아래 서보(좌우, S1) + 위 서보(상하, S2) + 2MP USB 카메라. 서보는 YB-SG90 |
| T-MINI PLUS 라이다 | 360° 거리 센서. SLAM·내비게이션용 (ROS 토픽 `/scan`) |
| 음성 모듈 (YB-MAB02) + 스피커 | 마이크 2개 입력 + 스피커 출력. LLM 음성 대화용 |
| 무선 게임패드 | 부팅 시 자동 실행되는 조종 프로그램으로 하드웨어를 바로 점검할 수 있다 |

## 3. 영상과 달랐던 점: XH2.54 전원 케이블이 없다 → 정상

처음에 제일 헷갈린 부분이다. 설명서의 *메인보드 전원 케이블* 항목을 보면 보드마다 전원선이 다르다.

- **Raspberry Pi / RDK X5 → 양쪽 ㄱ자 Type-C 케이블**
- Jetson Nano B01 → 양쪽 ㄱ자 DC 케이블
- Jetson Orin Nano → XH2.54 to DC 케이블

즉 *DC to XH2.54* 케이블은 **Orin 전용**이라 라즈베리파이 세트에는 원래 없다. 확장보드 V3.0에는 파이5 전원 규격을 지원하는 Type-C 출력(5.1V/5A)이 있어서 이 단자 하나로 파이에 전원을 준다.

> [!WARNING]
> 파이 배선도에 나오는 **"XH2.54 cable"은 다른 선**이다. 제어보드에서 **USB 허브 보드로 전원을 주는 빨강/검정 2핀 선**이다.

## 4. 조립 과정

### 4-1. 차체 열기

![기본 차체](./a04-chassis.jpg)
_도착한 기본 차체. 바퀴와 모터는 이미 조립되어 있다_

![윗판 나사](./a05-unscrew-top.jpg)
_윗판의 M3 나사를 풀어서 분리_

![윗판 분리](./a06-top-removed.jpg)
_윗판을 열면 OLED 4핀 선, 허브 전원선(XH2.54), 제어보드 연결선이 나와 있다_

![배터리 덮개](./a07-battery-cover.jpg)
_섀시 바닥의 배터리 덮개 분리_

### 4-2. 제어보드 확인과 배터리 장착

![제어보드](./a08-control-board.jpg)
_섀시 안에 미리 달려 있는 로봇 제어보드. 이 Type-C 출력에 파이 전원선을 꽂는다_

1. 제어보드 Type-C 출력에 **양쪽 ㄱ자 Type-C 케이블**을 꽂고 정해진 구멍으로 빼낸다. 판을 덮으면 다시 꽂기 어려우니 먼저 한다.
2. 배터리 덮개 옆의 작은 구멍에 **케이블타이 2개를 느슨하게** 걸고, 충전선을 통과시켜 옆면 구멍에 맞춘다.
3. 배터리를 T형 커넥터로 연결하고 벨크로로 고정한 뒤 덮개를 닫는다.

![배터리 장착](./a09-battery-installed.jpg)
_배터리 장착과 충전선 고정용 케이블타이_

### 4-3. 2DOF PTZ

> [!TIP]
> **서보는 각도를 초기화한 뒤에 조립해야 한다.** 서보 배선만 꽂고 PTZ 기구는 분리한 상태로 전원을 켜면 S1·S2가 (90, 90)으로 돌아간다. 그 상태에서 기어를 돌리지 않게 끼우고, 전원을 끈 뒤 나사를 조인다. 나는 이 단계를 놓쳤다(아래 트러블슈팅 참고).

![PTZ 서보와 카메라](./a10-ptz-servo-camera.jpg)
_위 서보(YB-SG90)와 카메라 보드. 카메라 USB 선이 함께 나온다_

![앞 커버](./a11-front-cover-oled.jpg)
_앞 장식 커버를 분리하고 아래 서보를 장착. OLED 뒷면에 GND·VCC·SCL·SDA 표기가 보인다_

![PTZ 윗부분](./a12-ptz-top.jpg)
_PTZ 윗부분(카메라 + 위 서보)을 아래 서보에 결합_

![PTZ 장착](./a13-ptz-on-chassis.jpg)
_앞 커버를 다시 달고 서보 선 두 가닥을 섀시 안으로 넣는다_

![서보 연결](./a14-servo-to-board.jpg)
_제어보드 PWM 서보 핀에 연결. 색 순서는 **갈색 → 검정(GND), 빨강 → 빨강, 노랑 → 노랑(신호)**. 아래 서보 S1, 위 서보 S2. 오른쪽 위 원형 구멍이 충전 단자_

### 4-4. 허브 보드와 라즈베리파이

![허브 보드](./a15-hub-board.jpg)
_USB HUB 확장보드(YB-ERU01)에 M2.5 구리기둥을 세운다. 빨강/검정 선이 허브 전원(XH2.54)_

![TF카드](./a16-tf-card.jpg)
_쿨러를 단 파이5와 공장 이미지가 들어 있는 128GB TF카드_

![파이 장착](./a17-pi-mount.jpg)
_허브 보드 위에 파이5를 2층으로 쌓고 M2.5 나사로 고정_

![팬 선과 GPIO](./a18-fan-gpio.jpg)
_쿨러 팬 선은 파이의 FAN 단자에_

![파이 배선](./a19-pi-cables.jpg)
_ㄱ자 Type-C 전원선과 USB 선들을 파이·허브에 연결_

![파이 배선 2](./a23-pi-wiring.jpg)
_OLED 4핀 선(GPIO), 카메라 USB, 허브 ↔ 파이 USB3 연결까지 마친 모습_

### 4-5. 위층 판: 라이다와 음성 모듈

![라이다 어댑터](./a20-lidar-adapter.jpg)
_위층 판 아랫면에 라이다 어댑터(M_CTR·GND·TX·RX·5V)를 고정_

![라이다 장착](./a21-lidar-mounted.jpg)
_T-MINI PLUS를 장착. **화살표가 차 앞쪽을 향하게** 단다. 아래쪽에 스피커가 대기 중_

![가조립](./a22-top-plate-fit.jpg)
_음성 모듈과 스피커를 구리기둥 위에 올리고 위치를 맞춰본다_

![위층 판 장착](./a25-top-plate-on.jpg)
_위층 판을 얹으면서 남는 USB 선은 묶어서 정리_

### 4-6. 완성

![완성](./a26-complete.jpg)
_완성. 앞쪽 PTZ 카메라, 위층 라이다·음성 모듈_

![완성 측면](./a28-complete-side.jpg)

## 5. 배선 총정리

| 케이블 | 연결 | 용도 |
|---|---|---|
| 양쪽 ㄱ자 Type-C | 제어보드 Type-C 출력 → 파이5 전원 | 전원 |
| XH2.54 2핀 (빨강/검정) | 제어보드 → 허브 보드 | 전원 |
| 옆 ㄱ자 Micro USB → USB | 제어보드 → 허브 USB3 | 데이터 (`/dev/myserial`) |
| 위 ㄱ자 USB → USB | 허브 ↔ 파이 USB3 (파란 포트) | 데이터 |
| 옆 ㄱ자 Type-C 25cm | 음성 모듈 → 허브 | 데이터 |
| 라이다 USB 선 | 라이다 어댑터 → 허브 | 데이터 |
| 카메라 USB 선 | PTZ 카메라 → 허브 | 데이터 |
| 서보 3핀 ×2 | 제어보드 S1·S2 | PWM 신호 |
| OLED 4핀 | 파이 GPIO I2C (GND·VCC·SCL·SDA) | I2C |
| 팬 선 | 파이 FAN 단자 | 전원 |
| 게임패드 수신기 | 파이 USB | 데이터 |

```text
[전원]
배터리 12.6V → 제어보드 ─┬→ 모터 4개, PWM 서보 (점퍼로 5V/6.8V 선택)
                        ├→ Type-C 5.1V/5A → 라즈베리파이5 → OLED, 팬
                        └→ XH2.54 → USB 허브 → 라이다·카메라·음성 모듈

[데이터]
라이다 / 카메라 / 음성 모듈 / 제어보드 → USB 허브 → 라즈베리파이5 (ROS2 in Docker)
라즈베리파이5 ── 속도·서보 명령 ──→ 제어보드 → 모터·서보
제어보드 ── 엔코더·IMU ──→ 라즈베리파이5 (odom, imu)
```

## 6. 첫 전원 투입

> [!DANGER]
> 처음 켤 때는 **바퀴가 바닥에 닿지 않게 로봇을 띄워두자.** 게임패드 테스트 중에 로봇이 튀어 나갈 수 있다.

| 확인 항목 | 정상 상태 |
|---|---|
| 허브 보드 LED | VBUS, 5V, DCIN 점등 |
| 파이 LED | 빨강 → 초록 |
| 음성 모듈 | 5V LED 점등 |
| OLED | CPU, 메모리, SD, IP 표시 |
| 게임패드 | START → 부저, R2 → 주행 잠금 해제, 스틱 → 주행 |

![허브 LED](./11-poweron-hub-leds.jpg)
_허브 보드 전원 LED_

![OLED](./13-oled-status.jpg)
_OLED 상태 화면. `192.168.1.11`은 공장 이미지의 기본 핫스팟 IP다_

공장 이미지는 부팅하면 **`ROSMASTER-M1` 핫스팟(비밀번호 `12345678`)**을 연다. SSH·VNC 계정은 `pi` / `yahboom`.

| 버튼 | 동작 |
|---|---|
| START | 부저 / 절전 해제 |
| R2 | 주행 잠금 해제 |
| 왼쪽 스틱 | 전진·후진·좌우 평행이동 |
| 오른쪽 스틱 | 제자리 회전 |
| 방향키 | PTZ 상하좌우 |
| R1 | PTZ 가운데 정렬 |

결과: **4바퀴 주행 정상**.

## 7. 삽질 기록

### SD 카드 리더기를 게임패드 수신기로 착각

![카드 리더기](./14-sd-card-reader.jpg)
_윗면에 SD 슬롯이 있으면 수신기가 아니라 카드 리더기다_

이미지 재설치·백업에 쓰니 버리지 말고 보관하자.

### 라이다 4핀 선 누락

위층 판을 따로 조립하다가 라이다 커넥터를 어댑터에 안 꽂고 넘어갔다. 판을 덮기 전에 **라이다 → 어댑터 → 허브** 연결을 꼭 확인하자.

### PTZ 버벅임 (해결 중)

주행은 정상인데 PTZ 움직임이 버벅인다. 의심되는 원인은 다음과 같다.

1. **서보 전압 점퍼**: SG90은 5V 서보라서 점퍼가 6.8V면 떨릴 수 있다.
2. **조립 전 각도 초기화 생략**: 서보가 기구 끝에 걸리고 있을 수 있다.
3. 카메라 선의 당김, 나사 과조임 같은 기구 원인

## 다음 편 예고

- 노트북에서 SSH / VNC 접속, 일반 WiFi로 전환
- 게임패드 자동실행 끄기, Docker(`run_humble.sh`) 진입
- 카메라·라이다 모델 설정 (`set_M1_usb_tmini.sh`)
- ROS2 토픽 확인 (`/scan`, odom, imu)과 제어 코드

## 참고 자료

- [YahboomTechnology/ROSMASTER-M1 (GitHub)](https://github.com/YahboomTechnology/ROSMASTER-M1)
- [ROSMASTER M1 Installation Video (For Raspberry Pi)](https://www.youtube.com/watch?v=YzhgxadNNls)
- Yahboom ROSMASTER M1 동봉 조립 설명서
