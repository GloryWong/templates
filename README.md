![GitHub License](https://img.shields.io/github/license/GloryWong/templates)
![GitHub commit activity](https://img.shields.io/github/commit-activity/w/GloryWong/templates)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/GloryWong/templates/release.yml)
![GitHub Release](https://img.shields.io/github/v/release/GloryWong/templates)
![GitHub Release Date](https://img.shields.io/github/release-date/GloryWong/templates)
![GitHub Issues or Pull Requests](https://img.shields.io/github/issues/GloryWong/templates)
![GitHub watchers](https://img.shields.io/github/watchers/GloryWong/templates)
![GitHub forks](https://img.shields.io/github/forks/GloryWong/templates)
![GitHub Repo stars](https://img.shields.io/github/stars/GloryWong/templates)
![NPM Version](https://img.shields.io/npm/v/%40gloxy%2Ftemplates)
![NPM Type Definitions](https://img.shields.io/npm/types/%40gloxy%2Ftemplates)
![NPM Downloads](https://img.shields.io/npm/dw/%40gloxy%2Ftemplates)
![Node Current](https://img.shields.io/node/v/%40gloxy%2Ftemplates)

# templates

Download and apply templates to new or existing projects. (Mainly for my own projects)

> Currently existing templates is located [here][1]. Configs is located [here][2]

### Install

```bash
pnpm add @gloxy/templates
```
### API

* `applyPartTemplate(<part-id>, [options])`

  * `part-id`: existing part templates id. Refer to [configs][2]

  * options:
    * force: overwrite existing files.
    * variables: assigned to the template placeholders. (Key: Value)
    * install: install package dependencies that the template depends
    * verbose: display verbose logs

* `applyPartTemplates(<part-ids>, [options])`

  * `part-ids`: array of existing part templates ids.

  * options: same as the options to applyPartTemplate

```typescript
import { applyPartTemplate, applyPartTemplates } from '@gloxy/templates'

applyPartTemplate('vscode', { force: true verbose: true, install: true })
applyPartTemplates(['vscode', 'npm', 'lintstaged'], { force: true, verbose: true, install: true })
```

### CLI

```bash
$ pnpm add -g @gloxy/templates
```

The `apply` command passes the argument (`part-id...`) and options to method `applyPartTemplates()` under the hood.

```bash
$ tmpl apply [options] <part-id...>
```

## Authors

👤 **GloryWong**

* Website: https://glorywong.com
* GitHub: [@GloryWong](https://github.com/GloryWong)

## Show Your Support

Give a ⭐️ if this project helped you!

[1]: <parts> 'Part templates'
[2]: <src/part-configs/configs.ts> 'Part template configs'
