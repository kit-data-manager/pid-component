# useful-orcid



<!-- Auto Generated Below -->


## Properties

| Property             | Attribute          | Description                                                                                                                                                            | Type      | Default                |
| -------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---------------------- |
| `affiliationAt`      | --                 | The date of the affiliation to display. (optional) Defaults to the current date.                                                                                       | `Date`    | `new Date(Date.now())` |
| `changingColors`     | `changing-colors`  | Should the table inside the component change colors every other line?                                                                                                  | `boolean` | `true`                 |
| `openStatus`         | `open-status`      | Should the details element be open by default?                                                                                                                         | `boolean` | `false`                |
| `orcid` _(required)_ | `orcid`            | The ORCiD to display, evaluate and link in this component. (required)                                                                                                  | `string`  | `undefined`            |
| `showAffiliation`    | `show-affiliation` | Whether to show the affiliation or not. (optional) Defaults to true.                                                                                                   | `boolean` | `true`                 |
| `showDepartment`     | `show-department`  | Whether to show the department of the affiliation or not. Depends internally on availability of the department in the ORCiD information. (optional) Defaults to false. | `boolean` | `false`                |
| `showOrcid`          | `show-orcid`       | Whether to show the ORCiD inline or not. (optional) Defaults to false.                                                                                                 | `boolean` | `false`                |


## Dependencies

### Depends on

- [foldable-component](../foldable-component)
- [beautiful-orcid](../beautiful-orcid)

### Graph
```mermaid
graph TD;
  useful-orcid --> foldable-component
  useful-orcid --> beautiful-orcid
  foldable-component --> intelligent-handle
  foldable-component --> handle-highlight
  intelligent-handle --> foldable-component
  intelligent-handle --> handle-highlight
  style useful-orcid fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
