import { DeepReadonly, forceNever } from "@/common";
import React from "react";
import {
  creditItem,
  credits,
  divider,
  resourceList,
} from "./credits.module.scss";

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
        "Clockwise Rotation",
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
        "Anticlockwise Rotation",
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
        "Cycle",
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
        "Progression",
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
        "Eye target",
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
        "Sideswipe",
        "https://game-icons.net/1x1/felbrigg/sideswipe.html",
      ],
    },
    {
      creator: ["Felbrigg", "https://blackdogofdoom.blogspot.com/"],
      retrievedFrom: ["game-icons.net", "https://game-icons.net"],
      license: License.CcBy30,
      type: CreditType.Image,
      resource: [
        "/src/assets/sideSwipeRight.svg",
        "Sideswipe Right",
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
        "Overhead",
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
        "Underhand",
        "https://game-icons.net/1x1/felbrigg/underhand.html",
      ],
    },
    {
      creator: ["Delapouite", "https://delapouite.com/"],
      retrievedFrom: ["game-icons.net", "https://game-icons.net"],
      license: License.CcBy30,
      type: CreditType.Image,
      resource: [
        "/src/assets/flat-platform.svg",
        "Flat platform",
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
        "Cube",
        "https://game-icons.net/1x1/delapouite/cube.html",
      ],
    },
    {
      creator: ["Lorc", "https://delapouite.com/"],
      retrievedFrom: ["game-icons.net", "https://game-icons.net"],
      license: License.CcBy30,
      type: CreditType.Image,
      resource: [
        "/src/assets/magic-swirl.svg",
        "Magic swirl",
        "https://game-icons.net/1x1/lorc/magic-swirl.html",
      ],
    },
  ];
  const grouped = groupCredits(creditList);

  return (
    <>
      <h3>Credits</h3>
      <div className={credits}>
        <div>Creator</div>
        <div>License</div>
        <div>Retrieved From</div>
        <div>Resources</div>
        <div className={divider} />
        <GroupedCredits credits={grouped} />
      </div>
    </>
  );
};
export default Credits;

const GroupedCredits: React.FC<{
  readonly credits: DeepReadonly<IGroupedCredits>;
}> = props => {
  const { credits } = props;

  const rows: React.ReactNode[] = [];
  for (const creator in credits) {
    const licenses = credits[creator];
    for (const license in licenses.group) {
      const licenseType = license as License;
      const sites = licenses.group[licenseType]!;
      for (const site in sites.group) {
        const mySite = sites.group[site];
        rows.push(
          <div key={`Creator^${creator}^${license}^${site}`}>
            <a href={licenses.creatorUrl}>{creator}</a>
          </div>,
          <div key={`License^${creator}^${license}^${site}`}>
            <a href={LicenseUrls[licenseType]}>{licenseType}</a>
          </div>,
          <div key={`Site^${creator}^${license}^${site}`}>
            <a href={mySite.retrievedFromUrl}>{site}</a>
          </div>,
          <div
            className={resourceList}
            key={`ResourceList^${creator}^${license}^${site}`}
          >
            {...mySite.resources.map(
              ([type, resource, resourceName, resourceUrl], ix) => {
                switch (type) {
                  case CreditType.Image:
                    return (
                      <div
                        className={creditItem}
                        key={`${type}^${resource}^${ix}`}
                      >
                        <a href={resourceUrl}>
                          <img src={resource} width={50} height={50} />
                          <br />
                          {resourceName}
                        </a>
                      </div>
                    );
                  default:
                    forceNever(type);
                }
              },
            )}
          </div>,
          <div
            className={divider}
            key={`Divider^${creator}^${license}^${site}`}
          />,
        );
      }
    }
  }
  return <>{rows}</>;
};

type Url = string;

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
    readonly creatorUrl: Url;
    count: number;
    readonly group: Partial<
      Record<
        License,
        {
          count: number;
          readonly group: Record<
            string, // retrieved from,
            {
              readonly retrievedFromUrl: Url;
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
