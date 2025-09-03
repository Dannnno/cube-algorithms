import { DeepReadonly, forceNever } from "@/common";
import React from "react";
import { credits } from "./credits.module.scss";

/**
 * Component that displays resources that need attribution, e.g.
 * icons licensed via CC By 3.0
 */
export const Credits: React.FC<{}> = _ => {
  const creditList: ICredit[] = [
    {
      creator: ["Delapouite", "https://delapouite.com/"],
      retrievedFrom: ["game-icons.net", "https://game-icons.net"],
      license: License.CcBy30,
      type: CreditType.Image,
      resource: [
        "/src/assets/clockwise-rotation.svg",
        "Clockwise Rotation Icon",
        "https://game-icons.net/1x1/delapouite/clockwise-rotation.html",
      ],
    },
    {
      creator: ["Delapouite", "https://delapouite.com/"],
      retrievedFrom: ["game-icons.net", "https://game-icons.net"],
      license: License.CcBy30,
      type: CreditType.Image,
      resource: [
        "/src/assets/anticlockwise-rotation.svg",
        "Anticlockwise Rotation Icon",
        "https://game-icons.net/1x1/delapouite/anticlockwise-rotation.html",
      ],
    },
    {
      creator: ["Lorc", "https://lorcblog.blogspot.com/"],
      retrievedFrom: ["game-icons.net", "https://game-icons.net"],
      license: License.CcBy30,
      type: CreditType.Image,
      resource: [
        "/src/assets/cycle.svg",
        "Cycle Icon",
        "https://game-icons.net/1x1/lorc/cycle.html",
      ],
    },
    {
      creator: ["Delapouite", "https://delapouite.com/"],
      retrievedFrom: ["game-icons.net", "https://game-icons.net"],
      license: License.CcBy30,
      type: CreditType.Image,
      resource: [
        "/src/assets/progression.svg",
        "Progression Icon",
        "https://game-icons.net/1x1/delapouite/progression.html",
      ],
    },
    {
      creator: ["Delapouite", "https://delapouite.com/"],
      retrievedFrom: ["game-icons.net", "https://game-icons.net"],
      license: License.CcBy30,
      type: CreditType.Image,
      resource: [
        "/src/assets/eye-target.svg",
        "Eye target icon",
        "https://game-icons.net/1x1/delapouite/eye-target.html",
      ],
    },
    {
      creator: ["Felbrigg", "https://blackdogofdoom.blogspot.com/"],
      retrievedFrom: ["game-icons.net", "https://game-icons.net"],
      license: License.CcBy30,
      type: CreditType.Image,
      resource: [
        "/src/assets/sideswipe.svg",
        "Sideswipe icon",
        "https://game-icons.net/1x1/felbrigg/sideswipe.html",
      ],
    },
    {
      creator: ["Felbrigg", "https://blackdogofdoom.blogspot.com/"],
      retrievedFrom: ["game-icons.net", "https://game-icons.net"],
      license: License.CcBy30,
      type: CreditType.Image,
      resource: [
        "/src/assets/overhead.svg",
        "Overhead icon",
        "https://game-icons.net/1x1/felbrigg/overhead.html",
      ],
    },
    {
      creator: ["Felbrigg", "https://blackdogofdoom.blogspot.com/"],
      retrievedFrom: ["game-icons.net", "https://game-icons.net"],
      license: License.CcBy30,
      type: CreditType.Image,
      resource: [
        "/src/assets/underhand.svg",
        "Underhand icon",
        "https://game-icons.net/1x1/felbrigg/underhand.html",
      ],
    },
    {
      creator: ["Delapouite", "https://delapouite.com/"],
      retrievedFrom: ["game-icons.net", "https://game-icons.net"],
      license: License.CcBy30,
      type: CreditType.Image,
      resource: [
        "/src/assets/horizontal-flip.svg",
        "Horizontal Flip icon",
        "https://game-icons.net/1x1/delapouite/horizontal-flip.html",
      ],
    },
    {
      creator: ["Delapouite", "https://delapouite.com/"],
      retrievedFrom: ["game-icons.net", "https://game-icons.net"],
      license: License.CcBy30,
      type: CreditType.Image,
      resource: [
        "/src/assets/flat-platform.svg",
        "Flat platform icon",
        "https://game-icons.net/1x1/delapouite/flat-platform.html",
      ],
    },
    {
      creator: ["Delapouite", "https://delapouite.com/"],
      retrievedFrom: ["game-icons.net", "https://game-icons.net"],
      license: License.CcBy30,
      type: CreditType.Image,
      resource: [
        "/src/assets/cube.svg",
        "Cube icon",
        "https://game-icons.net/1x1/delapouite/cube.html",
      ],
    },
  ];
  const grouped = groupCredits(creditList);

  return (
    <div className={credits}>
      <h4>Credits</h4>
      <table>
        <thead>
          <tr>
            <th>Creator</th>
            <th>License</th>
            <th>Retrieved From</th>
            <th>Resource</th>
            <th>Resource Name</th>
          </tr>
        </thead>
        <tbody>
          <GroupedCredits credits={grouped} />
        </tbody>
      </table>
    </div>
  );
};
export default Credits;

const GroupedCredits: React.FC<{
  readonly credits: DeepReadonly<IGroupedCredits>;
}> = props => {
  const { credits } = props;

  const rows: React.ReactElement[] = [];
  for (const creator in credits) {
    let creatorFirst = true;
    const licenses = credits[creator];
    for (const license in licenses.group) {
      let licenseFirst = true;
      const licenseType = license as License;
      const sites = licenses.group[licenseType]!;
      for (const site in sites.group) {
        const mySite = sites.group[site];
        mySite.resources.forEach(
          ([type, resource, resourceName, resourceUrl], ix) => {
            const key = `${creator}^${type}^${license}^${site}^${ix}`;
            const creditProps = {
              creatorFirst: ix === 0 && creatorFirst,
              creatorSpan: licenses.count,
              resourceCreator: creator,
              resourceCreatorUrl: licenses.creatorUrl,
              license: licenseType,
              licenseSpan: sites.count,
              licenseFirst: ix === 0 && licenseFirst,
              retrievedFrom: site,
              retrievedFromUrl: mySite.retrievedFromUrl,
              siteSpan: mySite.resources.length,
              siteFirst: ix === 0,
              resource: resource,
              resourceName: resourceName,
              resourceUrl: resourceUrl,
            };
            switch (type) {
              case CreditType.Image:
                rows.push(<ImageCreditRow {...creditProps} key={key} />);
                break;
              default:
                forceNever(type);
            }
          },
        );
        licenseFirst = false;
      }
      creatorFirst = false;
    }
  }
  return <>{rows}</>;
};

type Url = string;

interface ICreditRowProps {
  readonly resource: unknown;
  readonly resourceName: string;
  readonly resourceUrl: Url;
  readonly resourceCreator: string;
  readonly resourceCreatorUrl: Url;
  readonly retrievedFrom: string;
  readonly retrievedFromUrl: Url;
  readonly license: License;
  readonly creatorSpan: number;
  readonly creatorFirst?: boolean;
  readonly licenseSpan: number;
  readonly licenseFirst?: boolean;
  readonly siteSpan: number;
  readonly siteFirst?: boolean;
}

interface IImageCreditRowProps extends ICreditRowProps {
  readonly resource: string;
}

const ImageCreditRow: React.FC<IImageCreditRowProps> = props => {
  const {
    resource,
    resourceName,
    resourceUrl,
    resourceCreator,
    resourceCreatorUrl,
    creatorSpan,
    creatorFirst = false,
    retrievedFrom,
    retrievedFromUrl,
    siteSpan,
    siteFirst = false,
    license,
    licenseSpan,
    licenseFirst = false,
  } = props;
  return (
    <tr>
      {creatorFirst && (
        <td rowSpan={creatorSpan}>
          <a href={resourceCreatorUrl}>{resourceCreator}</a>
        </td>
      )}
      {licenseFirst && (
        <td rowSpan={licenseSpan}>
          <a href={LicenseUrls[license]}>{license}</a>
        </td>
      )}
      {siteFirst && (
        <td rowSpan={siteSpan}>
          <a href={retrievedFromUrl}>{retrievedFrom}</a>
        </td>
      )}
      <td>
        <a href={resourceUrl}>
          <img src={resource} width={50} height={50} />
          <br />
        </a>
      </td>
      <td>
        <a href={resourceUrl}>{resourceName}</a>
      </td>
    </tr>
  );
};

enum CreditType {
  Image,
}

enum License {
  CcBy30 = "CC BY 3.0",
}

const LicenseUrls: Record<License, Url> = {
  [License.CcBy30]: "https://creativecommons.org/licenses/by/3.0/",
};

type NamedUrl = readonly [string, string];

type IGroupedCredits = Record<
  string, // creator name
  {
    readonly creatorUrl: string;
    count: number;
    readonly group: Partial<
      Record<
        License,
        {
          count: number;
          readonly group: Record<
            string, // retrieved from,
            {
              readonly retrievedFromUrl: string;
              readonly resources: (readonly [
                CreditType,
                string,
                string,
                string,
              ])[];
            }
          >;
        }
      >
    >;
  }
>;

interface ICredit {
  readonly creator: NamedUrl;
  readonly retrievedFrom: NamedUrl;
  readonly license: License;
  readonly type: CreditType;
  readonly resource: [string, string, string];
}

function groupCredits(credits: readonly ICredit[]): IGroupedCredits {
  const group: IGroupedCredits = {};
  for (const credit of credits) {
    const {
      creator: [creatorName, creatorUrl],
      retrievedFrom: [retrievedFromSite, retrievedFromUrl],
      license,
      type,
      resource,
    } = credit;
    if (!(creatorName in group)) {
      group[creatorName] = { creatorUrl, count: 0, group: {} };
    }
    const thisCreator = group[creatorName];
    const thisGroup = thisCreator.group;
    if (!(license in thisGroup)) {
      thisGroup[license] = { count: 0, group: {} };
    }
    const thisLicense = thisGroup[license]!;
    const thisLicenseGroup = thisLicense.group;
    if (!(retrievedFromSite in thisLicenseGroup)) {
      thisLicenseGroup[retrievedFromSite] = {
        retrievedFromUrl,
        resources: [],
      };
    }
    thisLicenseGroup[retrievedFromSite].resources.push([type, ...resource]);
    ++thisCreator.count;
    ++thisLicense.count;
  }
  return group;
}
