#!/bin/bash
date +%s | sha256sum | base64 | head -c 64 ; echo