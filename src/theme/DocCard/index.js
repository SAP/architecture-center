/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, {useState, useRef, useEffect} from 'react';
import {
  findFirstSidebarItemLink,
} from '@docusaurus/plugin-content-docs/client';
import {usePluralForm} from '@docusaurus/theme-common';
import {translate} from '@docusaurus/Translate';
import {Card, Text, Icon, FlexBox, Tag, Title, Popover, ExpandableText} from '@ui5/webcomponents-react';
import "@ui5/webcomponents-icons/dist/dimension";
import "@ui5/webcomponents-icons/dist/action";
import styles from './styles.module.css';

function useCategoryItemsPlural() {
  const {selectMessage} = usePluralForm();
  return (count) =>
    selectMessage(
      count,
      translate(
        {
          message: '1 item|{count} items',
          id: 'theme.docs.DocCard.categoryDescription.plurals',
          description:
            'The default description for a category card in the generated index about how many items this category includes',
        },
        {count},
      ),
    );
}
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });
  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []); 
  return windowSize;
}
function CardLayout({ href, title, description, tags, lastUpdate, item }) {
  const moreTagsRef = useRef(null);
  const [popoverIsOpen, setPopoverIsOpen] = useState(false);
  const [compressedTags, setCompressedTags] = useState([])
  const [remainingTags, setRemainingTags] = useState([])
  const [readableTitle, setReadableTitle] = useState("")
  const [readableDescriptionCharacters, setReadableDescriptionCharacters] = useState(0)
  const size = useWindowSize();

  const card = useRef(null)

  const [componentSize, setComponentSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const cardElement = card.current;

    if (!cardElement) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setComponentSize({ width, height });
      }
    });

    resizeObserver.observe(cardElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if(size.width === undefined) return;
    setCompressedTags([])
    setRemainingTags([])
    let counter = 0
    const cardWidth = card.current.offsetWidth
    const tagsLength = tags.length
    let compressedTagsLength = 0
    for(const tag of tags) {
      counter += tag.label.length
      const remainingTagsLength = tagsLength - compressedTagsLength
      if(size.width <= 996 && counter < Math.round((cardWidth/360)*(remainingTagsLength<=1?49-compressedTagsLength:42-compressedTagsLength)) ||
        counter < Math.round((cardWidth/400)*(remainingTagsLength<=1?52-compressedTagsLength:46-compressedTagsLength))) {
        compressedTagsLength += 1
        setCompressedTags((_tags)=> [..._tags, tag])
        continue
      }
      counter -= tag.label.length
    }

    /* cut off description if it is too long */

    setReadableDescriptionCharacters(Math.round((cardWidth/360)*160))

    /* Change title length if title is too long */

    if(size.width <= 996) {
      if(title.length > Math.ceil((cardWidth/400)*100)) {
        setReadableTitle(title.length - title.slice(0, Math.round((cardWidth/400)*100)).length <=2?title:title.slice(0, Math.round((cardWidth/400)*100)) + "...")
        return
      }
      setReadableTitle(title)
      return
    }
    if(size.width > 996) {
      if(title.length > Math.ceil((cardWidth/400)*71)) {
        setReadableTitle(title.length - title.slice(0, Math.round((cardWidth/400)*71)).length <=2?title:title.slice(0, Math.round((cardWidth/400)*71)) + "...")
        return
      }
      setReadableTitle(title)
      return
    }
  }, [componentSize, description, tags, title]);
  
  

  useEffect(()=>{
    setRemainingTags(calculateRemainingTags())
  }, [compressedTags])

  function calculateRemainingTags() {
    return tags.filter(obj1 => 
      !compressedTags.some(obj2 => 
        JSON.stringify(obj1) === JSON.stringify(obj2)
      )
    );
  }

  return (
    <Card
      ref={card}
      style={{
        height: '290px',
        cursor: 'pointer',
        borderRadius: '10px',
        overflow: 'visible',
        transition: 'all 0.3s ease-in-out',
        backgroundColor: 'var(--ifm-card-background)',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
      }}
      onClick={(event) => {
        if (
          event.target.tagName === 'UI5-TAG' ||
          event.target.tagName === 'UI5-POPOVER'
        )
          return;
        window.location.href = href;
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--ifm-hover-overlay)';
        e.currentTarget.style.boxShadow = '0px 6px 16px rgba(0, 112, 242, 0.4)';
        e.currentTarget.style.transform = 'translateY(-3px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--ifm-card-background)';
        e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.transform = 'none';
      }}
    >
      <FlexBox direction='Column' justifyContent='End' style={{height: "290px", margin: 0, padding: 0}} gap={0}>
    {/* Custom Banner Image */}
    <FlexBox direction="Column">
      <div
        style={{
          height: '50px',
          backgroundImage: `url('${
              item.customProps?.isGuidance 
                ? '/img/Card_header_green.jpg' 
                : '/img/Card_header_blue.jpg'
            }')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Blue Left Accent */}
    </FlexBox>
    <FlexBox direction='Column' style={{height: "175px"}}>
      <FlexBox justifyContent="Start" alignItems="Center" style={{height: "60px"}}>
        <div
          style={{
            height: '40px',
            width: '6px',
            minWidth: '6px',
            borderTopRightRadius: '4px',
            borderBottomRightRadius: '4px',
            backgroundColor: item.customProps?.isGuidance ? '#06B400': '#0070F2',
            marginTop: "10px"
          }}
        />
        <Title style={{padding: '0 16px', paddingTop: '10px', cursor: "pointer", fontSize: "18px"}}>{readableTitle}</Title>
      </FlexBox>
    <FlexBox
      style={{
        padding: '16px 16px 0px 16px',
          textAlign: 'left',
          cursor: 'pointer',
          margin: 0,
      }}
    >
    <ExpandableText overflowMode="Popover" style={{cursor: "pointer"}} maxCharacters={readableDescriptionCharacters}>
      {description}
    </ExpandableText>
    </FlexBox>
    </FlexBox>
      {/* Tags container */}
      <FlexBox direction='Column' justifyContent='SpaceBetween' alignItems='Start' gap={10} style={{width: "100%", height: "65px"}}>
      <FlexBox
        style={{
          padding: '0 16px 0px 16px',
          margin: 0,
          bottom: 0,
          width: "100%"
        }}
        direction='Row'
        gap={3}
        alignItems='End'
        justifyContent='Start'
      >
        {compressedTags.map((tag, index) => (
          <a href={"tags/" + tag.tag} key={index}>
            <Tag
              design="Information"
              hideStateIcon
              className={styles.tag}
              title={tag.description || tag.label}
              style={{borderRadius: "8px"}}
            >
              <div style={{textWrap: "nowrap"}}>
                {tag.label}
              </div>
            </Tag>
          </a>
        ))}
        {remainingTags.length > 0 && (
          <>
            <Tag
              ref={moreTagsRef}
              style={{
                cursor: 'pointer',
              }}
              design='Information'
              hideStateIcon
              id="moreTags"
              onClick={() => {
                setPopoverIsOpen(!popoverIsOpen);
              }}
              title='Show more tags'
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none';
              }}
              className={styles.tag}
            >
              <div style={{padding: '0px 2px 0px 2px'}}>
              +{remainingTags.length}
              </div>
            </Tag>
            <Popover
              opener={moreTagsRef.current}
              open={popoverIsOpen}
              onClose={() => {
                setPopoverIsOpen(false);
              }}
              style={{cursor: "initial"}}
            >
              <div style={{display: "flex", flexDirection: "Column", gap: "10px"}}>
                {remainingTags.map((tag, index) => (
                  <a href={"tags/" + tag.tag} id="popover" key={index}>
                    <Tag
                      design="Information"
                      hideStateIcon
                      title={tag.description || tag.label}
                      style={{borderRadius: "8px", cursor: "pointer"}}
                      className={styles.tag}
                    >
                      {tag.label}
                    </Tag>
                  </a>
                ))}
              </div>
            </Popover>
          </>
        )}
      </FlexBox>
      {/* Date */}
      <FlexBox direction='row' alignItems='End' justifyContent='SpaceBetween' style={{padding: "0px 16px 10px 16px", margin: 0, width: "100%", bottom: 0}}>
      <FlexBox
      direction='Row'
      alignItems='Center'
      style={{fontStyle: "italic"}}
      >
        <Text style={{ cursor: "pointer", color: "gray", fontSize: 'var(--sapFontSmallSize)' }}>
          {"Last Update: "}
        </Text>
        <Text style={{cursor: "pointer", paddingLeft: 3, color: "gray", fontSize: 'var(--sapFontSmallSize)'}}>
          {lastUpdate
            ? new Date(lastUpdate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : ''}
        </Text>
      </FlexBox>
      <FlexBox
        style={{
          cursor: 'pointer',
          paddingBottom: 2
        }}
        onClick={(e) => {
          e.stopPropagation();
          window.open(href, '_blank');
        }}
      >
        <Icon name="action" title="Open in a new window" style={{ color: '#0070F2', width: "15px" }} />
      </FlexBox>
      </FlexBox>
      </FlexBox>
      </FlexBox>
    </Card>
  );
}

function CardCategory({item}) {
  const href = findFirstSidebarItemLink(item);
  const categoryItemsPlural = useCategoryItemsPlural();
  // Unexpected: categories that don't have a link have been filtered upfront
  if (!href) {
    return null;
  }
  return (
    <CardLayout
      href={href}
      title={item.label}
      description={item.description ?? categoryItemsPlural(item.items.length)}
    />
  );
}

function CardLink({ item }) {
  const href = item.customProps?.href;
  const description = item.description ?? item.customProps?.description ?? '';

  return (
    <CardLayout
      href={item.href ?? href}
      title={item.customProps.title}
      description={description.length > 300 ? description.substring(0, 300) + '...' : description}
      tags={item.customProps.tags}
      lastUpdate={item.customProps.last_update}
      item={item}
    />
  );
}


export default function DocCard({item}) {
  switch (item.type) {
    case 'link':
      return <CardLink item={item} />;
    case 'category':
      return <CardCategory item={item} />;
    default:
      throw new Error(`unknown item type ${JSON.stringify(item)}`);
  }
}