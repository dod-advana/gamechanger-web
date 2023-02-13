{{/*
Expand the name of the chart.
*/}}
{{- define "chart.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "chart.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "chart.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "chart.labels" -}}
helm.sh/chart: {{ include "chart.chart" . }}
{{ include "chart.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/component: {{ include "chart.fullname" . }}
app.kubernetes.io/part-of:  {{ include "chart.fullname" . }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "chart.selectorLabels" -}}
app.kubernetes.io/name: {{ include "chart.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "chart.serviceAccountName" -}}
{{- if .Values.serviceAccount }}
{{- default .Values.serviceAccount.name (include "chart.fullname" .) }}
{{- else }}
{{- include "chart.fullname" . }}
{{- end }}
{{- end }}

{{/*
Full image repo reference
*/}}
{{- define "chart.imageRepo" }}
{{- printf "%s/%s:%s" .Values.image.registry .Values.image.name (.Values.image.tag | default .Chart.AppVersion) }}
{{- end }}

{{/*
Env Config Secret Name
*/}}
{{- define "chart.envConfigSecretName" }}
{{- printf "%s.%s" (include "chart.fullname" .) "env-config-secret" }}
{{- end }}

{{- define "chart.envConfigSecretNameVault" }}
{{- printf "%s.%s" (include "chart.fullname" .) "env-config-secret-vault" }}
{{- end }}

{{- define "chart.vaultKey" }}
{{- printf "%s/%s" (.Values.vaultKey) (include "chart.fullname" .) }}
{{- end }}

{{- define "chart.vaultCertsKey" }}
{{- printf "%s/%s" (include "chart.vaultKey" .)  "certs" }}
{{- end }}


{{/*
File Config Secret Name
*/}}
{{- define "chart.fileConfigSecretName" }}
{{- printf "%s.%s" (include "chart.fullname" .) "file-config-secret" }}
{{- end }}

{{/*
Check File Config Defined
*/}}
{{- define "chart.isFileConfigDefined" }}
{{- if .Values.fileConfig -}}{{- if .Values.fileConfig.files -}}1{{- else -}}{{- end -}}{{- end -}}
{{- end }}

{{/*
One Time Job Name
*/}}
{{- define "chart.oneTimeJobName" }}
{{- printf "%s.%s" "job" (now | date "20060102-150405") }}
{{- end }}

{{/*
Return the appropriate apiVersion for ingress.
*/}}
{{- define "chart.capabilities.ingress.apiVersion" -}}
{{- if .Values.ingress -}}
{{- if .Values.ingress.apiVersion -}}
{{- .Values.ingress.apiVersion -}}
{{- else if semverCompare "<1.14-0" (include "chart.capabilities.kubeVersion" .) -}}
{{- print "extensions/v1beta1" -}}
{{- else if semverCompare "<1.19-0" (include "chart.capabilities.kubeVersion" .) -}}
{{- print "networking.k8s.io/v1beta1" -}}
{{- else -}}
{{- print "networking.k8s.io/v1" -}}
{{- end }}
{{- else if semverCompare "<1.14-0" (include "chart.capabilities.kubeVersion" .) -}}
{{- print "extensions/v1beta1" -}}
{{- else if semverCompare "<1.19-0" (include "chart.capabilities.kubeVersion" .) -}}
{{- print "networking.k8s.io/v1beta1" -}}
{{- else -}}
{{- print "networking.k8s.io/v1" -}}
{{- end -}}
{{- end -}}

{{/*
Renders a value that contains template.
Usage:
{{ include "chart.tplvalues.render" ( dict "value" .Values.path.to.the.Value "context" $) }}
*/}}
{{- define "chart.tplvalues.render" -}}
    {{- if typeIs "string" .value }}
        {{- tpl .value .context }}
    {{- else }}
        {{- tpl (.value | toYaml) .context }}
    {{- end }}
{{- end -}}

#check if service type is defined
{{- define "app.isNodePort" }}
{{- if .Values.service.http.nodePort -}}{{- if .Values.service.https.nodePort -}}1{{- else -}}{{- end -}}{{- end -}}
{{- end }}

{{/*
Generate backend entry that is compatible with all Kubernetes API versions.

Usage:
{{ include "chart.ingress.backend" (dict "serviceName" "backendName" "servicePort" "backendPort" "context" $) }}

Params:
  - serviceName - String. Name of an existing service backend
  - servicePort - String/Int. Port name (or number) of the service. It will be translated to different yaml depending if it is a string or an integer.
  - context - Dict - Required. The context for the template evaluation.
*/}}
{{- define "chart.ingress.backend" -}}
{{- $apiVersion := (include "chart.capabilities.ingress.apiVersion" .context) -}}
{{- if or (eq $apiVersion "extensions/v1beta1") (eq $apiVersion "networking.k8s.io/v1beta1") -}}
serviceName: {{ .serviceName }}
servicePort: {{ .servicePort }}
{{- else -}}
service:
  name: {{ .serviceName }}
  port:
    {{- if typeIs "string" .servicePort }}
    name: {{ .servicePort }}
    {{- else if or (typeIs "int" .servicePort) (typeIs "float64" .servicePort) }}
    number: {{ .servicePort | int }}
    {{- end }}
{{- end -}}
{{- end -}}

{{/*
Returns true if the ingressClassname field is supported
Usage:
{{ include "chart.ingress.supportsIngressClassname" . }}
*/}}
{{- define "chart.ingress.supportsIngressClassname" -}}
{{- if semverCompare "<1.18-0" (include "chart.capabilities.kubeVersion" .) -}}
{{- print "false" -}}
{{- else -}}
{{- print "true" -}}
{{- end -}}
{{- end -}}

{{/*
Return the target Kubernetes version
*/}}
{{- define "chart.capabilities.kubeVersion" -}}
{{- if .Values.global }}
    {{- if .Values.global.kubeVersion }}
    {{- .Values.global.kubeVersion -}}
    {{- else }}
    {{- default .Capabilities.KubeVersion.Version .Values.kubeVersion -}}
    {{- end -}}
{{- else }}
{{- default .Capabilities.KubeVersion.Version .Values.kubeVersion -}}
{{- end -}}
{{- end -}}

{{/*
Print "true" if the API pathType field is supported
Usage:
{{ include "chart.ingress.supportsPathType" . }}
*/}}
{{- define "chart.ingress.supportsPathType" -}}
{{- if (semverCompare "<1.18-0" (include "chart.capabilities.kubeVersion" .)) -}}
{{- print "false" -}}
{{- else -}}
{{- print "true" -}}
{{- end -}}
{{- end -}}

{{/*
Return true if cert-manager required annotations for TLS signed
certificates are set in the Ingress annotations
Ref: https://cert-manager.io/docs/usage/ingress/#supported-annotations
Usage:
{{ include "chart.ingress.certManagerRequest" ( dict "annotations" .Values.path.to.the.ingress.annotations ) }}
*/}}
{{- define "chart.ingress.certManagerRequest" -}}
{{ if or (hasKey .annotations "cert-manager.io/cluster-issuer") (hasKey .annotations "cert-manager.io/issuer") }}
    {{- true -}}
{{- end -}}
{{- end -}}

{{- define "app.web.fqdn" -}}
{{ $name := default (include "app.web.name" . | lower ) .Values.ingress.web.hostname }}
{{- if .Values.baseDomain -}}
{{- printf "%s.%s" $name .Values.baseDomain -}}
{{- else -}}
{{ printf "%s" $name }}
{{- end -}}
{{- end -}}

{{- define "app.web.name" -}}
  {{- printf "%s-web" (include "chart.fullname" .) -}}
{{- end -}}
