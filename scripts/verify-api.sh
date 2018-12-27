#!/bin/bash
result=$(curl -s http://localhost:3000/public/status)

if [[ "$result" =~ "{\"status\":\"online\"}" ]]; then
    exit 0
else
    exit 1
fi